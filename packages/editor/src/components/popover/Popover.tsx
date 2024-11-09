import { createRoot, useMemo, useRef } from '@docucraft/srender';

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

const StyledPopper = styled(Popper)(({ theme }) => ({
	border: `1px solid ${'#e1e4e8'}`,
	boxShadow: `0 8px 24px ${'rgba(149, 157, 165, 0.2)'}`,
	color: '#24292e',
	backgroundColor: '#fff',
	borderRadius: 6,
	minWidth: 300,
	zIndex: theme.zIndex.modal,
	fontSize: 13,
	...theme.applyStyles('dark', {
		border: `1px solid ${'#30363d'}`,
		boxShadow: `0 8px 24px ${'rgb(1, 4, 9)'}`,
		color: '#c9d1d9',
		backgroundColor: '#1c2128'
	})
}));

interface Config {
	title?: string | ReactNode;
	content?: ReactNode;
	actionsRedner?: (props: any) => ReactNode;
	fields: Field[];
}

interface Props extends Config {
	open: boolean;
	close: () => void;
	view: EditorView;
	onOk: (e: any) => void;
	onCancel?: () => void;
	children: ReactNode;
}

const PlainBoard = ({ open, view, children }: Props) => {
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
		<StyledPopper
			id={id}
			anchorEl={anchorEl}
			open={open}
			placement="bottom-start"
		>
			<ClickAwayListener onClickAway={close}>
				<Box>{children}</Box>
			</ClickAwayListener>
		</StyledPopper>
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

export function prompt<T extends FieldValues = FieldValues>(
	{ title, fields }: Config,
	view: EditorView
) {
	const { promise, reject, resolve } = Promise.withResolvers<T>();
	basePop({
		view,
		render: ({ close }) => (
			<Box sx={{ width: '480px', '& .form-content': { padding: '8px 15px' } }}>
				<Typography
					sx={{ fontSize: '14px', fontWeight: 'bold', padding: '8px 15px' }}
					variant="h2"
				>
					{title}
				</Typography>
				<BaseForm
					fields={fields}
					onSubmit={(data) => {
						resolve(data as T);
						close();
					}}
				>
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
		)
	});

	return promise;
}

export const usePopover = (view: EditorView) => {
	const Popover = {
		confirm: ({}: Config) => {}
	};

	return [Popover];
};
