import { createRoot, useMemo, useRef, useState } from '@docucraft/srender';

import Button from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Paper, { PaperProps } from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Popper, { PopperPlacementType } from '@mui/material/Popper';
import { EditorView } from 'prosemirror-view';
import { getSelectionRect } from '../../utils';
import { ReactNode } from 'react';
import Typography from '@mui/material/Typography';
import Grow from '@mui/material/Grow';
import Divider from '@mui/material/Divider';
import { BaseForm, Field } from '../Form';
import { FieldValues } from 'react-hook-form';
import { useEvent } from '../../utils/hooks';

interface Config {
	title?: string | ReactNode;
	content?: ReactNode;
	actionsRedner?: (props: any) => ReactNode;
	fields: Field[];
}

interface Props {
	open: boolean;
	close: () => void;
	view: EditorView;
	onCancel?: () => void;
	children: ReactNode;
	placement?: PopperPlacementType;
	slotProps?: {
		paper: PaperProps;
	};
}

const PlainBoard = ({
	open,
	view,
	children,
	close,
	placement = 'bottom-start',
	slotProps
}: Props) => {
	const id = open ? 'plain-board-popover' : void 0;
	const cacheRect = useRef<any>(null);

	const getBoundingClientRect = useEvent(() => {
		if (!open) return cacheRect.current;
		const res = (cacheRect.current = getSelectionRect(view));
		return res;
	}, []);

	const anchorEl = useMemo(() => ({ getBoundingClientRect }), []);

	return (
		<Popper
			id={id}
			anchorEl={anchorEl}
			open={open}
			placement={placement}
			transition
		>
			{({ TransitionProps }) => (
				<Grow
					{...TransitionProps}
					style={{ transformOrigin: 'top left' }}
					timeout={350}
				>
					<div>
						<ClickAwayListener onClickAway={close}>
							<Paper {...slotProps?.paper}>{children}</Paper>
						</ClickAwayListener>
					</div>
				</Grow>
			)}
		</Popper>
	);
};

export function basePop({
	render: ChildrenRender,
	view,
	placement,
	slotProps
}: {
	view: EditorView;
	render: (props: Pick<Props, 'close'>) => ReactNode;
} & Pick<Props, 'placement' | 'slotProps'>) {
	const rootRender = createRoot();
	const container = document.createElement('div');
	document.body.appendChild(container);
	const close = () => render(false);
	let visible = false;
	function render(open = true) {
		visible = open;
		rootRender.render(
			<PlainBoard
				open={open}
				close={() => {
					if (open) close();
				}}
				view={view}
				placement={placement}
				slotProps={slotProps}
			>
				<ChildrenRender close={close} />
			</PlainBoard>,
			container
		);
	}
	render();

	return [
		{
			render,
			show: () => render(),
			close,
			get visible() {
				return visible;
			},
			destroy: () => {
				rootRender.unmount();
				container.parentNode?.removeChild(container);
			}
		},
		rootRender,
		container
	] as const;
}

interface PromptProps extends Config {
	close: () => void;
	onSubmit: (v: FieldValues) => void;
}
const BasePrompt = ({ title, close, fields, onSubmit }: PromptProps) => (
	<Box sx={{ width: '480px', '& .form-content': { padding: '8px 15px' } }}>
		<Typography
			sx={{ fontSize: '14px', fontWeight: 'bold', padding: '8px 15px' }}
			variant="h2"
		>
			{title}
		</Typography>
		<BaseForm fields={fields} onSubmit={onSubmit}>
			<Divider />
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'flex-end',
					padding: '8px 15px'
				}}
			>
				<Button
					onClick={() => {
						close();
					}}
				>
					取消
				</Button>
				<Button type="submit">确认</Button>
			</Box>
		</BaseForm>
	</Box>
);

export function prompt<T extends FieldValues = FieldValues>(
	conf: Config,
	view: EditorView
) {
	const { promise, resolve } = Promise.withResolvers<T>();
	basePop({
		view,
		render: ({ close }) => (
			<BasePrompt
				{...conf}
				close={close}
				onSubmit={(data) => {
					resolve(data as T);
					close();
				}}
			/>
		)
	});

	return promise;
}

export const usePopover = (view: EditorView) => {
	const [promptVisible, setPromptVisible] = useState(false);
	const promptChildren = useRef(<></>);
	const closePrompt = () => setPromptVisible(false);
	const prompt = useEvent(
		function <T extends FieldValues = FieldValues>(conf: Config) {
			const { promise, resolve } = Promise.withResolvers<T>();
			promptChildren.current = (
				<BasePrompt
					{...conf}
					close={closePrompt}
					onSubmit={(data) => {
						resolve(data as T);
						closePrompt();
					}}
				/>
			);
			setPromptVisible(true);
			return promise;
		},
		{ visible: promptVisible }
	);

	const [plainVisible, setPlainVisible] = useState(false);
	const plainChildren = useRef(<></>);
	const closePlain = () => setPlainVisible(false);

	const plain = useEvent(
		function plain(children: JSX.Element) {
			plainChildren.current = children;
			setPlainVisible(true);
		},
		{ visible: plainVisible, close: closePlain }
	);

	const Popover = {
		prompt,
		plain
	};

	const placeholder = (
		<>
			<PlainBoard open={promptVisible} close={closePrompt} view={view}>
				{promptChildren.current}
			</PlainBoard>
			<PlainBoard open={plainVisible} close={closePlain} view={view}>
				{plainChildren.current}
			</PlainBoard>
		</>
	);

	return [Popover, placeholder] as const;
};

export const usePlainPopover = (children: any) => {
	const [visible, setVisible] = useState(false);
	const [anchorEl, setAnchorEl] = useState<HTMLElement>(null);
	const close = () => setVisible(false);

	const placeholder = (
		<Popper open={visible} anchorEl={anchorEl} placement="bottom-start">
			<ClickAwayListener onClickAway={close}>
				<Paper sx={{ marginTop: '6px' }}>{children}</Paper>
			</ClickAwayListener>
		</Popper>
	);
	const open = (el: HTMLElement) => {
		if (!anchorEl) setAnchorEl(el);
		setVisible(true);
	};
	const onClick = (e: Event) => {
		open(e.currentTarget as HTMLElement);
	};
	return [{ setAnchorEl, open, close, onClick }, placeholder] as const;
};
