import { NodeSelection, Plugin } from 'prosemirror-state';
import { closeFloatBar, showFloatBar } from './FloatBar';
import { getNodeView } from '../../utils/view';
import { findParentNode, selectInTypes } from '../../utils';
export default () => {
	let updated = false;
	return new Plugin({
		props: {
			handleDOMEvents: {
				mousedown: () => {
					updated = false;
				},
				mouseup: (view) => {
					const {
						state: { selection }
					} = view;

					if (!selection.empty && updated && view.hasFocus())
						showFloatBar(view);
				}
			}
		},
		view(v) {
			const types = selectInTypes(v);
			return {
				update(view, { selection: sel }) {
					const { state } = view;
					const { selection } = state;
					const { from, to } = sel;

					if (!selection.eq(sel)) {
						let node = findParentNode(selection, types);

						const blockId = node?.attrs.blockId;
						if (node) getNodeView(blockId)?.onFocusIn();

						node = findParentNode(sel, types);

						if (node && node.attrs.blockId !== blockId)
							getNodeView(node.attrs.blockId)?.onFocusOut({ reason: 'change' });
					}
					if (selection.from !== from || selection.to !== to) {
						closeFloatBar();
						updated = true;
					}
				},
				destroy() {}
			};
		}
	});
};
