import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import SvgAdd from '@docucraft/icons/svg/Add';
import SvgDragIndicator from '@docucraft/icons/svg/DragIndicatorFill';
import { useContext } from '@docucraft/srender';
import { BaseNodeView, nodeViewContext } from '../../utils/view';
import { Typography } from '@mui/material';
import { insert } from '../../commands/commands';
import { schema } from '../../model';
import { MouseEvent } from 'react';
import { RichTooltip as HtmlTooltip } from '../kits';
import './style.scss';

const Toolbar = () => {
	const { nodeView } = useContext(nodeViewContext);
	return (
		<Box
			sx={{
				'&': { fontSize: '22px', color: '#999' }
			}}
		>
			<Tooltip
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
			</Tooltip>
			<Tooltip
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
			</Tooltip>
		</Box>
	);
};

interface Props {
	children: any;
	nodeView?: BaseNodeView;
}

export default ({ children }: Props) => {
	return (
		<HtmlTooltip
			title={<Toolbar />}
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
