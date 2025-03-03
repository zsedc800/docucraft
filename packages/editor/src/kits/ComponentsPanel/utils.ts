import { Command, NodeSelection } from 'prosemirror-state';
import { BaseNodeView } from '../../utils/view';
import { schema } from '../../model';
import { BlockItem } from './interface';
import { overrides } from '../../utils';

export function onTrigger(
	nodeView: BaseNodeView,
	{ type = 'block', handler }: Pick<BlockItem, 'type' | 'handler'>
) {
	const { view } = nodeView;
	const { state, dispatch } = view;
	const {
		selection: { $from },
		tr,
		doc
	} = state;
	let transaction = tr;

	const isNodeSel = state.selection instanceof NodeSelection;
	if (isNodeSel) {
		(handler as Command)(state, dispatch, view);
	} else {
		const start = $from.before();
		if (type === 'block') {
			transaction = tr.setSelection(NodeSelection.create(doc, start));
		}

		const node = $from.parent;
		if (node.type === schema.nodes.paragraph)
			transaction = transaction.delete(start + 1, start + node.nodeSize - 1);

		(handler as Command)(overrides(state, { tr: transaction }), dispatch, view);
	}
	if (type === 'block') view.focus();
}
