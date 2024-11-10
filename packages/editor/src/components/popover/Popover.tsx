import { createRoot, useMemo, useRef, useState } from '@docucraft/srender';

import Button from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Popper from '@mui/material/Popper';
import { EditorView } from 'prosemirror-view';
import { getSelectionRect } from '../../utils';
import { ReactNode } from 'react';
import { Divider, Typography } from '@mui/material';
import { BaseForm, Field } from '../Form';
import { FieldValues } from 'react-hook-form';

let container: HTMLElement;

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
	// onOk: (e: any) => void;
	onCancel?: () => void;
	children: ReactNode;
}

const PlainBoard = ({ open, view, children, close }: Props) => {
	const id = open ? 'plain-board-popover' : void 0;
	const context = useRef(view);
	context.current = view;

	const anchorEl = useMemo(
		() => ({
			getBoundingClientRect: () => getSelectionRect(context.current!)
		}),
		[]
	);
	return (
		<Popper id={id} anchorEl={anchorEl} open={open} placement="bottom-start">
			<ClickAwayListener onClickAway={close}>
				<Paper>{children}</Paper>
			</ClickAwayListener>
		</Popper>
	);
};

function basePop({
	render: childrenRender,
	view
}: {
	view: EditorView;
	render: (props: Pick<Props, 'close'>) => ReactNode;
}) {
	const rootRender = createRoot();
	const container = document.createElement('div');
	document.body.appendChild(container);
	const close = () => render(false);

	const render = (open = true) => {
		rootRender.render(
			//@ts-ignore
			<PlainBoard open={open} close={close} view={view}>
				{childrenRender({ close })}
			</PlainBoard>,
			container
		);
	};
	render();

	return [rootRender, container];
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

interface IPopover {
	prompt<T extends FieldValues = FieldValues>(conf: Config): Promise<T>;
}

export const usePopover = (view: EditorView): [IPopover, ReactNode] => {
	const [open, setOpen] = useState(false);
	const close = () => setOpen(false);
	const children = useRef<ReactNode>(<></>);
	function prompt<T extends FieldValues = FieldValues>(conf: Config) {
		const { promise, resolve } = Promise.withResolvers<T>();
		children.current = (
			<BasePrompt
				{...conf}
				close={close}
				onSubmit={(data) => {
					resolve(data as T);
					close();
				}}
			/>
		);
		setOpen(true);
		return promise;
	}
	const Popover = {
		prompt
	};

	const placeholder = (
		<PlainBoard open={open} close={close} view={view}>
			{children.current}
		</PlainBoard>
	);

	return [Popover, placeholder];
};
