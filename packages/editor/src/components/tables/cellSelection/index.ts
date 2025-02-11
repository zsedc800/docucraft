import { EditorState } from 'prosemirror-state';
import { ResolvedPos } from 'prosemirror-model';
import { NodeSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Decoration } from 'prosemirror-view';
import { TextSelection } from 'prosemirror-state';
import {
	CellBookmark,
	CellSelection,
	drawCellSelection,
	normalizeSelection
} from './cellSelection';
import { MergeCellStatus, TableRect } from '../interface';
import { TableMap } from '../tableMap';
import { cellAround, cellNear, tableEditingKey } from '../utils';

export function selectedRect(state: EditorState): TableRect {
	const sel = state.selection;
	const $pos = selectionCell(state);
	const table = $pos.node(-1);
	const tableStart = $pos.start(-1);
	const map = TableMap.get(table);

	const rect =
		sel instanceof CellSelection
			? map.rectBetween(
					sel.$anchorCell.pos - tableStart,
					sel.$headCell.pos - tableStart
				)
			: map.findCell($pos.pos - tableStart);

	return { ...rect, tableStart, map, table };
}

export function drawCellSel(
	view: EditorView,
	type: 'col' | 'row' | 'all' | 'clear'
) {
	const cells: Decoration[] = [];
	const { state, dispatch } = view;
	const { selection } = state;
	if (type === 'clear')
		return dispatch(state.tr.setMeta(tableEditingKey, { cellDecos: [] }));
	if (!(selection instanceof TextSelection)) return;
	const { $from } = selection;
	const $cell = cellAround($from);
	if (!$cell) return;
	let cellSelection: CellSelection;
	if (type === 'col') {
		cellSelection = CellSelection.colSelection($cell);
	} else if (type === 'row') {
		cellSelection = CellSelection.rowSelection($cell);
	} else {
		const start = $cell.start(-1);
		const table = $cell.node(-1);
		const map = TableMap.get(table);
		const first = map.map[0];
		const last = map.map[map.map.length - 1];
		cellSelection = CellSelection.create(
			state.doc,
			start + first,
			start + last
		);
	}

	cellSelection.forEachCell((node, pos) => {
		cells.push(
			Decoration.node(pos, pos + node.nodeSize, { class: 'selectCell' })
		);
	});
	dispatch(state.tr.setMeta(tableEditingKey, { cellDecos: cells }));
}

export function selectionCell(state: EditorState): ResolvedPos {
	const sel = state.selection as CellSelection | NodeSelection;
	if ('$anchorCell' in sel && sel.$anchorCell) {
		return sel.$anchorCell.pos > sel.$headCell.pos
			? sel.$anchorCell
			: sel.$headCell;
	} else if (
		'node' in sel &&
		sel.node &&
		sel.node.type.spec.tableRole == 'cell'
	) {
		return sel.$anchor;
	}
	const $cell = cellAround(sel.$head) || cellNear(sel.$head);
	if ($cell) return $cell;

	throw new RangeError(`No cell found around position ${sel.head}`);
}

export function pointsAtCellSelection(
	view: EditorView,
	{ x, y }: { x: number; y: number }
) {
	const {
		state: { selection, doc }
	} = view;

	if (!(selection instanceof CellSelection)) return false;
	const pos = view.posAtCoords({
		left: x,
		top: y
	});

	if (!pos) return;
	const $cell = cellAround(doc.resolve(pos.pos));
	if (!$cell) return;
	let res = false;
	selection.forEachCell((node, pos) => {
		if ($cell.pos === pos) res = true;
	});
	return res;
}

export function hasMergedCells(state: EditorState): MergeCellStatus {
	const rect = selectedRect(state),
		{ table, map } = rect;
	let hasMerged = false,
		cellCount = 0;
	const seen: Record<number, boolean> = {};
	for (let row = rect.top; row < rect.bottom; row++) {
		for (let col = rect.left; col < rect.right; col++) {
			const cellPos = map.map[row * map.width + col];
			const cell = table.nodeAt(cellPos);
			if (!cell || seen[cellPos]) continue;
			seen[cellPos] = true;

			cellCount++;
			const colspan = cell.attrs.colspan || 1;
			const rowspan = cell.attrs.rowspan || 1;
			if (colspan > 1 || rowspan > 1) {
				hasMerged = true;
			}
		}
	}

	return cellCount > 1
		? hasMerged
			? 'hasMerged'
			: 'none'
		: hasMerged
			? 'onlyMerged'
			: 'none';
}

export { CellBookmark, CellSelection, drawCellSelection, normalizeSelection };
