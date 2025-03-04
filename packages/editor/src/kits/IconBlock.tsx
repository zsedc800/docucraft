import { useContext } from '@docucraft/srender';
import { CSSProperties, ReactNode } from 'react';
import { nodeViewContext } from '../utils/view';
import Typography from '@mui/material/Typography';
import { NodeSelection } from 'prosemirror-state';
import { schema } from '../model';
import { classnames, overrides } from '../utils';
import { NormalTooltip } from './Tooltip';
import { BaseProps, Overrides } from '../interface';
export const IconBlock = ({
	title,
	icon: Ico,
	handler,
	handleClose,
	type = 'block',
	className,
	...props
}: Overrides<
	BaseProps,
	{
		title: string;
		icon: (...args: any[]) => ReactNode;
		handler: (...args: any[]) => any;
		handleClose?: () => void;
		type?: 'block' | 'inline' | 'pop';
		style?: CSSProperties;
	}
>) => {
	const { nodeView } = useContext(nodeViewContext);
	const { view } = nodeView;
	return (
		<NormalTooltip
			disableInteractive
			title={<Typography sx={{ fontSize: '12px' }}>{title}</Typography>}
			placement="top"
		>
			<Ico
				{...props}
				className={classnames('iconButton', className)}
				role="button"
				// tabindex={0}
				onClick={() => {
					const { state } = view;
					const {
						selection: { $from },
						tr,
						doc
					} = state;

					let transaction = tr;
					if (!(state.selection instanceof NodeSelection)) {
						const start = $from.before();
						transaction = tr.setSelection(NodeSelection.create(doc, start));

						const node = $from.parent;
						if (node.type === schema.nodes.paragraph)
							transaction = transaction.delete(
								start + 1,
								start + node.nodeSize - 1
							);
					}

					if (type === 'block') {
						handler(overrides(state, { tr: transaction }), view.dispatch, view);
						view.focus();
					} else {
						handler(nodeView);
					}

					handleClose?.();
				}}
			/>
		</NormalTooltip>
	);
};
