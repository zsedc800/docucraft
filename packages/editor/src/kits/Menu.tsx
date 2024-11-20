import {
	cloneElement,
	forwardRef,
	useEffect,
	useImperativeHandle,
	useState
} from '@docucraft/srender';
import { ClickAwayListener, Paper, PaperProps } from '@mui/material';
import Popper, { PopperPlacementType } from '@mui/material/Popper';
import { ReactNode } from 'react';
// import { useForkRef } from '../../utils/hooks';

function Menu() {}
interface Props {
	children: any;
	placement?: PopperPlacementType;
	content?: ReactNode;
	slotProps?: { paper: PaperProps };
}
export const SubMenu = forwardRef<{ close: () => void }, Props>(
	// @ts-ignore
	function SubMenu(
		{ children, placement = 'right-start', content, slotProps }: Props,
		ref: any
	) {
		const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
		const handleClick = (e: Event) => {
			setAnchorEl(e.currentTarget as HTMLElement);
		};
		const handleClose = () => setAnchorEl(null);
		const open = Boolean(anchorEl);
		const originalChildProps = children.props;
		const onClick = (e: Event) => {
			const { onClick: toClick } = originalChildProps;
			if (typeof toClick === 'function') toClick(e);
			handleClick(e);
		};

		useImperativeHandle(ref, () => ({ close: handleClose }));

		// const handleRef = useForkRef(originalChildProps.ref, )
		return (
			<>
				{cloneElement(children, { ...originalChildProps, onClick })}
				<Popper anchorEl={anchorEl} open={open} placement={placement}>
					<ClickAwayListener onClickAway={handleClose}>
						<Paper sx={{ margin: '0 15px' }} {...slotProps?.paper}>
							{content}
						</Paper>
					</ClickAwayListener>
				</Popper>
			</>
		);
	}
);
export default Menu;
