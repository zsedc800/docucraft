import { EditorState, Plugin } from 'prosemirror-state';
import { TableState, cellAround, isEmpty, tableEditingKey } from './utils';
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
	domInCell,
	handleKeyDown,
	handleMouseDown,
	handlePaste,
	handleTripleClick
} from './input';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { TableView, TableViewConstructor } from './tableView';
import './style.scss';
import { TableCellView, TableHeadCellView, TableRowView } from './view';

export type TableEditingOptions = {
	allowTableNodeSelection?: boolean;
};

export function tableEditing({
	allowTableNodeSelection = false
}: TableEditingOptions): Plugin {
	const getDecorations = (state: EditorState) => {
		let decs: Decoration[] = [];
		decs = decs.concat(drawCellSelection(state));
		state.doc.descendants((node, pos) => {
			if (node.type.name !== 'table') return;
		});
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
				mousedown: handleMouseDown
			},
			handlePaste,
			handleTripleClick,
			handleKeyDown
			// createSelectionBetween(view) {
			// 	console.log('cre');

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
