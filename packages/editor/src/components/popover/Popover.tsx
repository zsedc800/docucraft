import { createRoot, useEffect, useState } from '@docucraft/srender';
import { Button, ClickAwayListener, Paper } from '@mui/material';
import Popper from '@mui/material/Popper';
import { PopperProps } from '@mui/material/Popper/BasePopper.types';
import { EditorView } from 'prosemirror-view';
import { getSelectionRect } from '../../utils';
import { ReactNode } from 'react';

let container: HTMLElement;

interface Props {
	open: boolean;
	close: () => void;
	view: EditorView;
	onOk: (e: any) => void;
	children: ReactNode;
}
const Confirm = ({ open, close, view, onOk, children }: Props) => {
	const id = open ? 'confirm-popover' : void 0;
	const [anchorEl, setAnchorEl] = useState<PopperProps['anchorEl']>({
		getBoundingClientRect: () => getSelectionRect(view) as any
	});
	// useEffect(() => {
	// 	if (open) {
	// 		setAnchorEl({ getBoundingClientRect: () => getSelectionRect(view) });
	// 	}
	// }, [open]);

	console.log(anchorEl, open, 1234);

	return (
		<Popper id={id} anchorEl={anchorEl} open={open} placement="bottom-start">
			{/* <ClickAwayListener onClickAway={close}> */}
			<Paper>
				<Button onClick={onOk}>确认</Button>
				{children}
			</Paper>
			{/* </ClickAwayListener> */}
		</Popper>
	);
};

interface Config {}
const rootRender = createRoot();
export function confirm({}: Config, view: EditorView) {
	if (!container) {
		container = document.createElement('div');
		document.body.appendChild(container);
	}

	const { promise, reject, resolve } = Promise.withResolvers();

	const render = (open = true) => {
		rootRender.render(
			//@ts-ignore
			<Confirm
				open={open}
				close={() => render(false)}
				view={view}
				onOk={resolve}
			/>,
			container
		);
	};
	render();
	return promise;
}
