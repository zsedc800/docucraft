import Popover, { PopoverProps } from '@mui/material/Popover';
import {
	cloneElement,
	forwardRef,
	useImperativeHandle,
	useState
} from '@docucraft/srender';
import { ReactNode } from 'react';

interface Props {
	children: any;
	anchorOrigin?: PopoverProps['anchorOrigin'];
	content?:
		| ReactNode
		| ((p: { close: () => void } & { [k: string]: any }) => ReactNode);
}
export default forwardRef<{ close: () => void }, Props>(function BasicPopover(
	{
		children,
		anchorOrigin = { vertical: 'center', horizontal: 'right' },
		content
	}: Props,
	ref
) {
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);
	const id = open ? 'simple-popover' : undefined;
	const originalChildProps = children.props;
	const onClick = (e: React.MouseEvent<HTMLElement>) => {
		const { onClick: toClick } = originalChildProps;
		if (typeof toClick === 'function') toClick(e);
		handleClick(e);
	};
	useImperativeHandle(ref, () => ({ close: handleClose }));
	return (
		<>
			{cloneElement(children, { ...originalChildProps, onClick })}
			<Popover
				id={id}
				open={open}
				anchorEl={anchorEl}
				onClose={handleClose}
				anchorOrigin={anchorOrigin}
			>
				{typeof content === 'function'
					? content({ close: handleClose })
					: content}
			</Popover>
		</>
	);
});
