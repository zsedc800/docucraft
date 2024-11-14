import { tooltipClasses } from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import SvgAdd from '@docucraft/icons/svg/Add';
import SvgDragIndicator from '@docucraft/icons/svg/DragIndicatorFill';
import { useContext, useEffect, useRef, useState } from '@docucraft/srender';
import { BaseNodeView, nodeViewContext } from '../../utils/view';
import Typography from '@mui/material/Typography';
import { insert } from '../../commands/commands';
import { schema } from '../../model';
import { CSSProperties, MouseEvent, ReactNode } from 'react';
import { RichTooltip as HtmlTooltip, NormalTooltip } from '../kits';
import './style.scss';

const Toolbar = ({
	before,
	after,
	style
}: {
	before: ReactNode;
	after: ReactNode;
	style?: CSSProperties;
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

							insert(pos, schema.nodes.paragraph, {})(
								view.state,
								view.dispatch,
								view
							);
							view.focus();
						}
					}}
				/>
			</NormalTooltip>
			<NormalTooltip
				disableInteractive
				title={
					<Typography textAlign="center">
						按住可以拖动
						<br />
						点击展开更多
					</Typography>
				}
			>
				<SvgDragIndicator className="iconButton" />
			</NormalTooltip>
			<>{after}</>
		</Box>
	);
};

interface Props {
	children: any;
	nodeView?: BaseNodeView;
	toolsBefore?: ReactNode;
	toolsAfter?: ReactNode;
}

export default ({ children, toolsAfter, toolsBefore }: Props) => {
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
	return (
		<HtmlTooltip
			title={
				<Toolbar style={{ height }} before={toolsBefore} after={toolsAfter} />
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
