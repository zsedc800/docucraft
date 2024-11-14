import { useContext } from '@docucraft/srender';
import { ReactNode } from 'react';
import { nodeViewContext } from '../../utils/view';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { NodeSelection } from 'prosemirror-state';
import { schema } from '../../model';
import { overrides } from '../../utils';
import { styled } from '@mui/material/styles';
import { fontSize } from '@mui/system';

export const IconBlock = ({
	title,
	icon: Ico,
	handler,
	handleClose,
	type
}: {
	title: string;
	icon: (...args: any[]) => ReactNode;
	handler: (...args: any[]) => any;
	handleClose?: () => void;
	type?: 'block';
}) => {
	const { nodeView } = useContext(nodeViewContext);
	const { view } = nodeView;
	return (
		<Tooltip
			title={<Typography sx={{ fontSize: '12px' }}>{title}</Typography>}
			placement="top"
		>
			<Ico
				className="iconButton"
				onClick={() => {
					const { state, dispatch } = view;
					const {
						selection: { $from },
						tr,
						doc
					} = state;

					if (type === 'block') {
						const start = $from.before();

						let transction = tr.setSelection(NodeSelection.create(doc, start));
						const node = $from.parent;
						if (node.type === schema.nodes.paragraph)
							transction = transction.delete(start + 1, start + node.nodeSize);

						handler(overrides(state, { tr: transction }), view.dispatch, view);
					} else {
						handler(nodeView);
					}

					view.focus();
					handleClose?.();
				}}
			/>
		</Tooltip>
	);
};

export const RichTooltip = styled(({ className, ...props }: TooltipProps) => (
	<Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
	[`&  .${tooltipClasses.tooltip}.richTooltip`]: {
		backgroundColor: 'transparent',
		color: 'rgba(0, 0, 0, 0.87)',
		fontSize: theme.typography.pxToRem(14),
		border: 'none',
		padding: '0 0 0 0',
		margin: '1px 0 0 0'
	}
}));

export const NormalTooltip = styled(({ className, ...props }: TooltipProps) => (
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
