import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import SvgAdd from '@docucraft/icons/svg/Add';
import SvgDragIndicator from '@docucraft/icons/svg/DragIndicator';
import './style.scss';
import {
	Children,
	ComponentChild,
	VNode,
	cloneElement,
	useContext
} from '@docucraft/srender';
import { EditorView } from 'prosemirror-view';
import { BaseNodeView, nodeViewContext } from '../../utils/view';
import { insert } from '../../commands/commands';
import { isNotEmpty } from '../../utils';
import { schema } from '../../model';
const HtmlTooltip = styled(
	({ className, ...props }: TooltipProps) =>
		(<Tooltip {...props} classes={{ popper: className }} />) as any
)(({ theme }) => ({
	[`& .${tooltipClasses.tooltip}`]: {
		backgroundColor: 'transparent',
		color: 'rgba(0, 0, 0, 0.87)',
		fontSize: theme.typography.pxToRem(14),
		border: 'none',
		padding: '0 0 0 0',
		margin: '1px 0 0 0'
	}
}));

interface ToolbarProps {
	view: EditorView;
}
const Toolbar = ({ view }: ToolbarProps) => {
	const { nodeView } = useContext(nodeViewContext);
	return (
		// @ts-ignore
		<Box
			sx={{
				'&': { fontSize: '22px', color: '#999' }
			}}
		>
			<SvgAdd
				className="iconButton"
				onClick={() => {
					const curPos = nodeView.getPos();
					const { view } = nodeView;
					if (curPos || curPos === 0) {
						insert(curPos + nodeView.node.nodeSize, schema.nodes.paragraph, {})(
							view.state,
							view.dispatch,
							view
						);
					}
				}}
			/>
			<Tooltip title="kk" slotProps={{ popper: { disablePortal: true } }}>
				<SvgDragIndicator className="iconButton" />
			</Tooltip>
		</Box>
	);
};

interface Props {
	children: ComponentChild;
	nodeView: BaseNodeView;
}

export default ({ children, nodeView }: Props) => {
	return (
		/* @ts-ignore */
		<HtmlTooltip
			title={(<Toolbar view={nodeView.view} />) as any}
			placement="left-start"
			slotProps={{
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
			{children as any}
		</HtmlTooltip>
	) as any;
};
