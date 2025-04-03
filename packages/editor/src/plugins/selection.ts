import { NodeSelection, Plugin } from 'prosemirror-state';
import { CellSelection } from '../components/tables/cellSelection/cellSelection';
import { closeFloatBar, showFloatBar } from '../components/floatBar';
import { BaseNodeView, getNodeView } from '../utils/view';
import EditorView from '../EditorView';
import { nextTick } from '../utils';

function isNodeContains(node: Node, target: Node) {
	let n = target;
	while (n) {
		console.log(n, node, 'n');

		if (n === node) return true;
		n = n.parentNode;
	}
	return false;
}

export default () => {
	let updated = false;
	return new Plugin({
		props: {
			handleDOMEvents: {
				keydown(view, e) {
					const {
						state: { selection }
					} = view;
					if (selection instanceof NodeSelection && selection.node.isAtom) {
						e.preventDefault();
						return true;
					}
					return false;
				},
				mousedown: () => {
					updated = false;
				},
				mousemove: () => {
					updated = true;
				},
				mouseup: (view: EditorView, e) => {
					const {
						state: { selection }
					} = view;

					if (
						selection.empty ||
						selection instanceof CellSelection ||
						selection instanceof NodeSelection
					)
						return;
					showFloatBar(view);
				}
			}
		},
		view(v) {
			const root = v.dom.ownerDocument;
			const lastNodes = new Map<string, BaseNodeView>();
			const onSelectionChange = () => {
				const sel = root.getSelection();

				if (!sel || sel.type === 'None' || !sel.isCollapsed) return;
				const { anchorNode } = sel;
				for (const [id, nodeView] of lastNodes) {
					if (!anchorNode || !isNodeContains(nodeView.dom, anchorNode))
						nextTick(() => {
							console.log(
								nodeView,
								anchorNode,
								nodeView.dom.contains(anchorNode),
								nodeView.dom === anchorNode,

								'last'
							);

							nodeView.onFocusOut({ reason: 'change' });
							lastNodes.delete(id);
						});
				}

				for (let scan = anchorNode; scan; scan = scan.parentNode) {
					const blockId = (scan as HTMLElement).dataset?.blockId;
					const nodeView = getNodeView(blockId);
					if (nodeView)
						nextTick(() => {
							if (lastNodes.get(blockId) === nodeView) return;
							console.log(nodeView, lastNodes, 'ddd');
							lastNodes.set(blockId, nodeView);
							console.log(lastNodes, 'last');

							nodeView.onFocusIn();
						});
				}
			};
			root.addEventListener('selectionchange', onSelectionChange);
			return {
				update(view, { selection: sel }) {
					const { state } = view;
					const { selection } = state;
					const { from, to } = sel;
					if (!selection.eq(sel)) closeFloatBar();
					// if (selection.from !== from || selection.to !== to) {
					// 	closeFloatBar();
					// 	updated = true;
					// }
				},
				destroy() {
					root.removeEventListener('selectionchange', onSelectionChange);
					lastNodes.clear();
				}
			};
		}
	});
};
