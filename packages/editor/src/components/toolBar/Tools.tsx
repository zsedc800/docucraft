import { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SvgAdd from '@docucraft/icons/svg/Add';
import SvgDragIndicator from '@docucraft/icons/svg/DragIndicatorFill';
import {
	useContext,
	useEffect,
	useRef,
	useState,
	CSSProperties,
	MouseEvent,
	ReactNode
} from '@docucraft/srender';
import { BaseNodeView, nodeViewContext } from '../../utils/view';
import { insert } from '../../commands/commands';
import { schema } from '../../model';
import { RichTooltip as HtmlTooltip, NormalTooltip } from '../../kits';
import { default as OPMenus, OPMenuProps } from '../../kits/Button/OPMenus';
import { initDrag } from '../../plugins/dragSort';
import './style.scss';

const Toolbar = ({
	before,
	after,
	style,
	close,
	extraMenu
}: {
	before: ReactNode;
	after: ReactNode;
	style?: CSSProperties;
	close?: () => void;
	extraMenu?: OPMenuProps['extraMenu'];
}) => {
	const { nodeView } = useContext(nodeViewContext);
	const dragIndicator = useRef<HTMLDivElement>(null);

	useEffect(() => {
		initDrag(dragIndicator.current, nodeView);
	}, []);

	return (
		<Box
			style={style}
			sx={{
				'&': {
					fontSize: '22px',
					color: '#999',
					display: 'flex',
					alignItems: 'center'
				}
			}}
		>
			<>{before}</>
			<NormalTooltip
				disableInteractive
				title={
					<Typography textAlign="center">
						点击向下插入
						<br />
						按住alt键 + 点击将向上插入
					</Typography>
				}
			>
				<SvgAdd
					className="iconButton"
					onClick={(e: MouseEvent) => {
						const before = e.altKey;
						const curPos = nodeView.getPos();
						const { view, node } = nodeView;

						if (curPos || curPos === 0) {
							const pos = before ? curPos : curPos + node.nodeSize;

							insert(pos, schema.nodes.paragraph, { initialPop: true })(
								view.state,
								view.dispatch,
								view
							);
							view.focus();
						}
					}}
				/>
			</NormalTooltip>
			<div ref={dragIndicator} className="iconButton">
				<OPMenus close={close} extraMenu={extraMenu}>
					<SvgDragIndicator />
				</OPMenus>
			</div>
			<>{after}</>
		</Box>
	);
};

interface Props {
	children: any;
	nodeView?: BaseNodeView;
	toolsBefore?: ReactNode;
	toolsAfter?: ReactNode;
	visible?: boolean;
	style?: CSSProperties;
	placement?: TooltipProps['placement'];
	extraMenu?: OPMenuProps['extraMenu'];
}

export default ({
	children,
	toolsAfter,
	toolsBefore,
	visible,
	style,
	placement = 'left-start',
	extraMenu
}: Props) => {
	const anchorEl = useRef<HTMLElement>(null);
	const [height, setHeight] = useState<number | undefined>(undefined);
	useEffect(() => {
		if (anchorEl.current) {
			const { lineHeight, paddingTop } = getComputedStyle(anchorEl.current);
			setHeight(parseInt(lineHeight) + parseInt(paddingTop));
		}
	}, []);
	const { ref } = children;
	children.ref = (node: HTMLElement) => {
		anchorEl.current = node;
		if (typeof ref === 'function') {
			ref(node);
		} else if (ref) ref.current = node;
	};
	const [open, setOpen] = useState(false);
	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);
	return (
		<HtmlTooltip
			open={typeof visible === 'undefined' ? open : visible}
			onClose={handleClose}
			onOpen={handleOpen}
			title={
				<Toolbar
					style={{ ...style, height }}
					before={toolsBefore}
					after={toolsAfter}
					close={handleClose}
					extraMenu={extraMenu}
				/>
			}
			placement={placement}
			slotProps={{
				tooltip: {
					className: 'richTooltip'
				},
				popper: {
					sx: {
						[`&.${tooltipClasses.popper}[data-popper-placement*="left"] .${tooltipClasses.tooltip}`]:
							{
								marginRight: '0px'
							}
					}
				}
			}}
		>
			{children}
		</HtmlTooltip>
	);
};
