import { EditorState, Plugin } from 'prosemirror-state';
import { isEmpty, tableEditingKey } from './utils';
import {
	CellSelection,
	drawCellSelection,
	pointsAtCellSelection
} from './cellSelection';

export { tableNodes } from './schema';
export { TableView } from './tableView';
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
import { preventDispatch } from '../../utils/hooks';
import { TableState } from './interface';
import { NodeViewParameters } from '../../interface';

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
				tableRow: (...args: NodeViewParameters) => new TableRowView(...args),
				tableCell: (...args: NodeViewParameters) => new TableCellView(...args),
				tableHeader: (...args: NodeViewParameters) =>
					new TableHeadCellView(...args)
			},
			decorations(state) {
				return this.getState(state)?.decorations;
			},
			handleDOMEvents: {
				mousedown: handleMouseDown,
				focus(view) {
					// callNodeView(view, 'onFocusIn')?.();
				},
				blur(view, event) {
					// callNodeView(view, 'onFocusOut')?.({ reason: 'blur', event });
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
