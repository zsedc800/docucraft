import { NodeSelection, Plugin } from 'prosemirror-state';
import { CellSelection } from '../components/tables/cellSelection/cellSelection';
import { closeFloatBar, showFloatBar } from '../components/floatBar';
import { BaseNodeView, getNodeView } from '../utils/view';
import EditorView from '../EditorView';
import { nextTick } from '../utils';

export default () => {
	let updated = false;
	return new Plugin({
		props: {
			handleDOMEvents: {
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
					console.log(e, 'eee');

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

				if (!sel || sel.type === 'None') return;
				const { anchorNode } = sel;
				for (const [id, nodeView] of lastNodes) {
					if (!nodeView.dom.contains(anchorNode))
						nextTick(() => {
							nodeView.onFocusOut({ reason: 'change' });
							lastNodes.delete(id);
						});
				}

				for (let scan = anchorNode; scan; scan = scan.parentNode) {
					const blockId = (scan as HTMLElement).dataset?.blockId;
					const nodeView = getNodeView(blockId);
					if (nodeView)
						nextTick(() => {
							nodeView.onFocusIn();
							lastNodes.set(blockId, nodeView);
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
