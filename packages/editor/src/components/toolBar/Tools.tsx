import { tooltipClasses } from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import SvgAdd from '@docucraft/icons/svg/Add';
import SvgDragIndicator from '@docucraft/icons/svg/DragIndicatorFill';
import { useContext, useEffect, useRef, useState } from '@docucraft/srender';
import { BaseNodeView, nodeViewContext } from '../../utils/view';
import Typography from '@mui/material/Typography';
import { createNode, insert } from '../../commands/commands';
import { schema } from '../../model';
import { CSSProperties, MouseEvent, ReactNode } from 'react';
import { RichTooltip as HtmlTooltip, NormalTooltip } from '../../kits';
import './style.scss';
import { OPMenus } from '../../kits/Button';

const Toolbar = ({
	before,
	after,
	style,
	close
}: {
	before: ReactNode;
	after: ReactNode;
	style?: CSSProperties;
	close?: () => void;
}) => {
	const { nodeView } = useContext(nodeViewContext);

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
			<OPMenus close={close}>
				<SvgDragIndicator className="iconButton" />
			</OPMenus>
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
}

export default ({
	children,
	toolsAfter,
	toolsBefore,
	visible,
	style
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
		typeof ref === 'function' ? ref(node) : (ref.current = node);
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
				/>
			}
			placement="left-start"
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
