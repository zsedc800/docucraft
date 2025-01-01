import { EditorState, Plugin } from 'prosemirror-state';
import {
	TableState,
	cellAround,
	isEmpty,
	pointsAtCellSelection,
	tableEditingKey
} from './utils';
import {
	CellSelection,
	drawCellSelection,
	normalizeSelection
} from './cellSelection';
import { fixTables } from './fixtables';

export { tableNodeTypes, tableNodes } from './schema';
export { TableView } from './tableView';
export { columnResizing } from './columnresizing';
import {
	handleKeyDown,
	handleMouseDown,
	handlePaste,
	handleTripleClick
} from './input';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { TableViewConstructor } from './tableView';
import './style.scss';
import { TableCellView, TableHeadCellView, TableRowView } from './view';
import { callNodeView, fixSelection } from '../../utils';
import { preventDispatch } from '../../utils/hooks';

export type TableEditingOptions = {
	allowTableNodeSelection?: boolean;
};

export function tableEditing({
	allowTableNodeSelection = false
}: TableEditingOptions): Plugin {
	const getDecorations = (state: EditorState) => {
		let decs: Decoration[] = [];
		decs = decs.concat(drawCellSelection(state));
		return decs;
	};

	return new Plugin<TableState>({
		key: tableEditingKey,
		state: {
			init(_, state) {
				return {
					decorations: DecorationSet.create(state.doc, getDecorations(state)),
					set: null
				};
			},
			apply(tr, value, _, state) {
				const st = tr.getMeta(tableEditingKey);
				let { set = null, hoverDecos, cellDecos } = st || {};

				const decorations = DecorationSet.create(
					state.doc,
					getDecorations(state).concat(
						// hoverDecos ? hoverDecos : value.hoverDecos || []
						cellDecos ? cellDecos : value.cellDecos || []
					)
				);

				if (!isEmpty(value.set) && isEmpty(set)) {
					const { deleted, pos } = tr.mapping.mapResult(value.set!);
					set = deleted ? null : pos;
				}

				return {
					set: isEmpty(set) || set == -1 ? null : set,
					decorations,
					cellDecos
				};
			}
		},

		props: {
			nodeViews: {
				table: TableViewConstructor,
				tableRow: (...args) => new TableRowView(...args),
				tableCell: (...args) => new TableCellView(...args),
				tableHeader: (...args) => new TableHeadCellView(...args)
			},
			decorations(state) {
				return this.getState(state)?.decorations;
			},
			handleDOMEvents: {
				mousedown: handleMouseDown,
				focus(view) {
					callNodeView(view, 'onFocusIn')?.();
				},
				blur(view, event) {
					callNodeView(view, 'onFocusOut')?.({ reason: 'blur', event });
				},
				mouseup(view, event) {
					const { clientX: x, clientY: y } = event;
					if (event.button === 2 && pointsAtCellSelection(view, { x, y })) {
						preventDispatch();
					}
				}
			},
			handlePaste,
			handleTripleClick,
			handleKeyDown
			// createSelectionBetween(view) {
			// 	const set = tableEditingKey.getState(view.state)?.set;
			// 	console.log(set, 'selection');

			// 	return !isEmpty(set) ? view.state.selection : null;
			// }
		},
		view(view) {
			let timeout: number;
			const onSelectionChange = () => {
				timeout = setTimeout(() => {
					const selection = document.getSelection();
					const { state } = view;
					const { from, to, anchor } = state.selection;

					if (selection && selection.anchorNode) {
						const { anchorNode, anchorOffset } = selection;
						const pos = view.posAtDOM(anchorNode, anchorOffset);
						if (pos < 0) return;

						if (pos !== anchor) fixSelection(view, from, to);
					}
				}, 0);
			};
			document.addEventListener('selectionchange', onSelectionChange);
			return {
				update({ state: { selection }, dom }, { selection: sel }) {
					if (timeout) clearTimeout(timeout);
					if (!selection.eq(sel)) {
						if (selection instanceof CellSelection) {
							window.getSelection()?.removeAllRanges();
							dom.blur();
						}
					}
				},
				destroy() {
					document.removeEventListener('selectionchange', onSelectionChange);
				}
			};
		}

		// appendTransaction(_, oldState, newState) {
		// 	return normalizeSelection(
		// 		newState,
		// 		// newState.tr,
		// 		fixTables(newState, oldState),
		// 		allowTableNodeSelection
		// 	);
		// }
	});
}
