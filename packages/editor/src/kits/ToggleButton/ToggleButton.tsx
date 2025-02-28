import {
	CSSProperties,
	ForwardRefExoticComponent,
	createPortal,
	forwardRef,
	useImperativeHandle,
	useRef,
	useState
} from '@docucraft/srender';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Paper, { PaperProps } from '@mui/material/Paper';
import { PopoverVirtualElement } from '@mui/material/Popover';
import Popper from '@mui/material/Popper';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import { MouseEvent, ReactNode } from 'react';
import SvgArrowDown from '@docucraft/icons/svg/ArrowDropDown';
import { BaseProps } from '../../interface';

interface PanelProps {
	close: () => void;
}

export type Trigger = 'click' | 'hover' | 'contextmenu';

interface Props {
	children: ReactNode;
	onClick?: (e: MouseEvent<HTMLDivElement>) => void;
	onClose?: () => void;
	title?: string | ReactNode;
	subPanel?: ((attrs: PanelProps) => ReactNode) | ReactNode;
	trigger?: Trigger;
	value?: string | number;
	offset?: number;
	style?: CSSProperties;
	IconComponent?: ((e: any) => ReactNode) | ForwardRefExoticComponent<any>;
	slotProps?: { paper: PaperProps };
	actived?: boolean;
	placement?: TooltipProps['placement'];
	maskProps?: { color?: string };
}

const NormalTooltip = styled(({ className, ...props }: TooltipProps) => (
	<Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
	[`& .${tooltipClasses.tooltip}`]: {
		backgroundColor: theme.palette.common.black,
		fontSize: 12
	},
	'& p': {
		fontSize: 12
	}
}));

export default forwardRef<{ close(): void }, BaseProps<Props>>(
	(
		{
			children,
			onClick,
			title,
			subPanel,
			trigger = 'click',
			offset = 6,
			style,
			IconComponent = SvgArrowDown,
			slotProps,
			actived,
			placement = 'bottom',
			maskProps,
			onClose,
			...attrs
		},
		ref
	) => {
		const [anchorEl, setAnchorEl] = useState<
			HTMLElement | PopoverVirtualElement | null
		>(null);
		const popperRef = useRef<HTMLDivElement>(null);

		const handleClose = () => {
			setAnchorEl(null);
			onClose && onClose();
		};
		const handleClick = (e: MouseEvent<HTMLDivElement>) => {
			if (typeof onClick === 'function') onClick(e);
			setAnchorEl(e.currentTarget);
		};
		const onMouseEnter = (e: MouseEvent<HTMLDivElement>) => {
			setAnchorEl(e.currentTarget);
		};
		const onMouseLeave = (e: MouseEvent) => {
			if (trigger !== 'hover') return;
			if (!popperRef.current?.matches(':hover')) handleClose();
		};
		const onContextMenu = (e: MouseEvent) => {
			e.preventDefault();
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

		const anchorProps: Record<string, any> = {};
		if (trigger === 'click') {
			anchorProps['onClick'] = handleClick;
		} else if (trigger === 'hover') {
			anchorProps['onMouseEnter'] = onMouseEnter;
			anchorProps['onMouseLeave'] = onMouseLeave;
		} else if (trigger === 'contextmenu') {
			anchorProps['onContextMenu'] = onContextMenu;
			anchorProps['onMouseLeave'] = onMouseLeave;
		}

		const open = Boolean(anchorEl);

		useImperativeHandle(ref, () => ({ close: handleClose }));

		const content = (
			<div
				role="button"
				data-actived={actived}
				style={style}
				onClick={onClick}
				{...attrs}
				{...anchorProps}
			>
				{children}
				{subPanel && <IconComponent />}
			</div>
		);
		const body = title ? (
			<NormalTooltip placement={placement} title={title} disableInteractive>
				{content}
			</NormalTooltip>
		) : (
			content
		);

		let popper;
		popper = (
			<Popper
				anchorEl={anchorEl}
				open={open}
				placement="bottom-start"
				sx={{ zIndex: 9999 }}
			>
				<ClickAwayListener onClickAway={handleClose}>
					<div
						className="panel"
						ref={popperRef}
						style={{ paddingTop: offset }}
						onMouseLeave={onMouseLeave}
					>
						<Paper elevation={8} tabIndex={-1} {...slotProps?.paper}>
							{typeof subPanel === 'function'
								? subPanel({ close: handleClose })
								: subPanel}
						</Paper>
					</div>
				</ClickAwayListener>
			</Popper>
		);
		return (
			<>
				{body}
				{open && maskProps
					? createPortal(<div className="tooltip-masker"></div>, document.body)
					: null}
				{popper}
			</>
		);
	}
);
