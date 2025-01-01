import { Attrs, Node, ResolvedPos } from 'prosemirror-model';
import { TableMap } from './tableMap';
import { tableNodeTypes } from './schema';
import {
	EditorState,
	NodeSelection,
	PluginKey,
	TextSelection
} from 'prosemirror-state';
import { CellSelection } from './cellSelection';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';

export const cellMinWidth = 80;

export interface TableState {
	decorations: DecorationSet;
	set: number | null;
	hoverDecos?: Decoration[];
	cellDecos?: Decoration[];
}
export const tableEditingKey = new PluginKey<TableState>('selectingCells');

export interface CellAttrs {
	colspan: number;
	rowspan: number;
	colwidth: number[] | null;
}

export type MutableAttrs = Record<string, unknown>;

export const addColspan = (attrs: CellAttrs, pos: number, n = 1): Attrs => {
	const result = { ...attrs, colspan: attrs.colspan + n };
	if (result.colwidth) {
		result.colwidth = result.colwidth.slice();
		for (let i = 0; i < n; i++) result.colwidth.splice(pos, 0, 0);
	}
	return result;
};

export function columnIsHeader(
	map: TableMap,
	table: Node,
	col: number
): boolean {
	const headerCell = tableNodeTypes(table.type.schema).headerCell;
	for (let row = 0; row < map.height; row++) {
		if (table.nodeAt(map.map[col + row * map.width])!.type != headerCell)
			return false;
	}
	return true;
}

export function isInTable(state: EditorState): boolean {
	const $head = state.selection.$head;
	for (let d = $head.depth; d > 0; d--)
		if ($head.node(d).type.spec.tableRole == 'row') return true;

	return false;
}

export function pointsAtCell($pos: ResolvedPos): boolean {
	return $pos.parent.type.spec.tableRole == 'row' && !!$pos.nodeAfter;
}

export function inSameTable($cellA: ResolvedPos, $cellB: ResolvedPos): boolean {
	return (
		$cellA.depth == $cellB.depth &&
		$cellA.pos >= $cellB.start(-1) &&
		$cellA.pos <= $cellB.end(-1)
	);
}

export function colCount($pos: ResolvedPos): number {
	return TableMap.get($pos.node(-1)).colCount($pos.pos - $pos.start(-1));
}

export function nextCell(
	$pos: ResolvedPos,
	axis: 'horiz' | 'vert',
	dir: number
): ResolvedPos | null {
	const table = $pos.node(-1);
	const map = TableMap.get(table);
	const tableStart = $pos.start(-1);
	const moved = map.nextCell($pos.pos - tableStart, axis, dir);
	return moved == null ? null : $pos.node(0).resolve(tableStart + moved);
}

export function removeColSpan(attrs: CellAttrs, pos: number, n = 1): CellAttrs {
	const result: CellAttrs = { ...attrs, colspan: attrs.colspan - n };

	if (result.colwidth) {
		result.colwidth = result.colwidth.slice();
		result.colwidth.splice(pos, n);
		if (!result.colwidth.some((w) => w > 0)) result.colwidth = null;
	}
	return result;
}

export function cellAround($pos: ResolvedPos): ResolvedPos | null {
	for (let d = $pos.depth - 1; d > 0; d--)
		if ($pos.node(d).type.spec.tableRole == 'row')
			return $pos.node(0).resolve($pos.before(d + 1));

	return null;
}

export function moveCellForward($pos: ResolvedPos): ResolvedPos {
	return $pos.node(0).resolve($pos.pos + $pos.nodeAfter!.nodeSize);
}

export function cellNear($pos: ResolvedPos): ResolvedPos | undefined {
	for (
		let after = $pos.nodeAfter, pos = $pos.pos;
		after;
		after = after.firstChild, pos++
	) {
		const role = after.type.spec.tableRole;
		if (role == 'cell' || role == 'headerCell') return $pos.doc.resolve(pos);
	}

	for (
		let before = $pos.nodeBefore, pos = $pos.pos;
		before;
		before = before.lastChild, pos--
	) {
		const role = before.type.spec.tableRole;
		if (role == 'cell' || role == 'headerCell') {
			return $pos.doc.resolve(pos - before.nodeSize);
		}
	}
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

export const isEmpty = (val: unknown) =>
	val === null || val === undefined || Number.isNaN(val);

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

	console.log(pos, 'pos');
	if (!pos) return;
	const $cell = cellAround(doc.resolve(pos.pos));
	if (!$cell) return;
	let res = false;
	selection.forEachCell((node, pos) => {
		if ($cell.pos === pos) res = true;
	});
	return res;
}
