import { useContext } from '@docucraft/srender';
import { CSSProperties, ReactNode } from 'react';
import { nodeViewContext } from '../utils/view';
import Typography from '@mui/material/Typography';
import { NodeSelection } from 'prosemirror-state';
import { schema } from '../model';
import { overrides } from '../utils';
import { NormalTooltip } from './Tooltip';
export const IconBlock = ({
	title,
	icon: Ico,
	handler,
	handleClose,
	type,
	style
}: {
	title: string;
	icon: (...args: any[]) => ReactNode;
	handler: (...args: any[]) => any;
	handleClose?: () => void;
	type?: 'block';
	style?: CSSProperties;
}) => {
	const { nodeView } = useContext(nodeViewContext);
	const { view } = nodeView;
	return (
		<NormalTooltip
			disableInteractive
			title={<Typography sx={{ fontSize: '12px' }}>{title}</Typography>}
			placement="top"
		>
			<Ico
				style={style}
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
		</NormalTooltip>
	);
};
