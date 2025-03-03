import { cloneElement, useRef, useState } from '@docucraft/srender';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Paper, { PaperProps } from '@mui/material/Paper';
import Popper, { PopperPlacementType } from '@mui/material/Popper';
import { PopoverVirtualElement } from '@mui/material/Popover';

import { ReactNode } from 'react';

interface Props {
	children: any;
	placement?: PopperPlacementType;
	content?:
		| ReactNode
		| ((p: { close: (e?: any) => void } & { [k: string]: any }) => ReactNode);
	slotProps?: { paper: PaperProps };
	trigger?: 'click' | 'hover' | 'contextmenu';
	onOpen?: () => void;
	onClose?: () => void;
}

export default function Menu({
	children,
	content,
	placement = 'right-start',
	trigger = 'click',
	slotProps,
	onOpen,
	onClose
}: Props) {
	const [anchorEl, setAnchorEl] = useState<
		HTMLElement | PopoverVirtualElement | null
	>(null);
	const popperRef = useRef<HTMLDivElement>(null);
	const childRef = useRef<HTMLElement>(null);
	const event = useRef<Event>(null);
	const handleOpen = (e: Event) => {
		if (e.currentTarget !== anchorEl)
			setAnchorEl(e.currentTarget as HTMLElement);
		onOpen?.();
	};
	const handleClose = (c = true) => {
		anchorEl ? setAnchorEl(null) : void 0;
		if (c) onClose?.();
	};
	const open = Boolean(anchorEl);
	const originalChildProps = children.props;
	const onClick = (e: Event) => {
		const { onClick: toClick } = originalChildProps;
		if (typeof toClick === 'function') toClick(e);

		handleOpen(e);
	};
	const onContextMenu = (e: MouseEvent) => {
		e.preventDefault();
		event.current = e;
		const { onContextMenu: fn } = originalChildProps;
		if (typeof fn === 'function') fn(e);
		setAnchorEl({
			getBoundingClientRect: () =>
				({
					left: e.clientX - 2,
					top: e.clientY - 4,
					width: 1,
					height: 1
				}) as DOMRect,
			nodeType: 1
		});
	};
	const onMouseEnter = (e: MouseEvent) => {
		const { onMouseEnter: fn } = originalChildProps;
		if (typeof fn === 'function') fn(e);
		handleOpen(e);
	};
	const onMouseLeave = (e: MouseEvent) => {
		const { onMouseLeave: fn } = originalChildProps;
		if (typeof fn === 'function') fn(e);
		if (!popperRef.current?.matches(':hover')) handleClose();
	};
	const childProps: Record<string, any> = {
		ref: (node: HTMLElement) => {
			childRef.current = node;
			const { ref } = originalChildProps;
			if (typeof ref === 'function') ref(node);
			else if (ref) ref.current = node;
		}
	};

	if (trigger === 'click') {
		childProps['onClick'] = onClick;
	} else if (trigger === 'hover') {
		childProps['onMouseEnter'] = onMouseEnter;
		childProps['onMouseLeave'] = onMouseLeave;
	} else if (trigger === 'contextmenu') {
		childProps['onContextMenu'] = onContextMenu;
		childProps['onMouseLeave'] = onMouseLeave;
	}

	return (
		<>
			{cloneElement(children, { ...originalChildProps, ...childProps })}
			<Popper
				anchorEl={anchorEl}
				open={open}
				placement={placement}
				sx={{ zIndex: 9999 }}
			>
				<ClickAwayListener onClickAway={() => handleClose()}>
					<Paper
						// onMouseLeave={() =>
						// 	childRef.current?.matches(':hover') ? void 0 : handleClose()
						// }

						ref={popperRef}
						elevation={8}
						{...slotProps?.paper}
					>
						{typeof content === 'function'
							? content({ close: handleClose, event: event.current })
							: content}
					</Paper>
				</ClickAwayListener>
			</Popper>
		</>
	);
}
