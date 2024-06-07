import { Fragment, Node, NodeType, Schema, Slice } from 'prosemirror-model';
import { Transform } from 'prosemirror-transform';
import { CellAttrs, removeColSpan } from './utils';
import { tableNodeTypes } from './schema';
import { ColWidths, Rect, TableMap } from './tableMap';
import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { CellSelection } from './cellSelection';

export type Area = { width: number; height: number; rows: Fragment[] };
export const pastedCells = (slice: Slice): Area | null => {
	if (!slice.size) return null;
	let { content, openStart, openEnd } = slice;

	while (
		content.childCount == 1 &&
		((openStart > 0 && openEnd > 0) ||
			content.child(0).type.spec.tableRole == 'table')
	) {
		openStart--;
		openEnd--;
		content = content.child(0).content;
	}
	const first = content.child(0);
	const role = first.type.spec.tableRole;
	const schema = first.type.schema,
		rows = [];

	if (role == 'row') {
		for (let i = 0; i < content.childCount; i++) {
			let cells = content.child(i).content;
			const left = i ? 0 : Math.max(0, openStart - 1);
			const right = i < content.childCount - 1 ? 0 : Math.max(0, openEnd - 1);
			if (left || right)
				cells = fitSlice(
					tableNodeTypes(schema).row,
					new Slice(cells, left, right)
				).content;
			rows.push(cells);
		}
	} else if (role == 'cell' || role == 'headerCell') {
		rows.push(
			openStart || openEnd
				? fitSlice(
						tableNodeTypes(schema).row,
						new Slice(content, openStart, openEnd)
					).content
				: content
		);
	} else {
		return null;
	}
	return ensureRectangular(schema, rows);
};

function ensureRectangular(schema: Schema, rows: Fragment[]): Area {
	const widths: ColWidths = [];
	for (let i = 0; i < rows.length; i++) {
		const row = rows[i];
		for (let j = row.childCount - 1; j >= 0; j--) {
			const { rowspan, colspan } = row.child(j).attrs;
			for (let r = i; r < i + rowspan; r++)
				widths[r] = (widths[r] || 0) + colspan;
		}
	}
	let width = 0;
	for (let r = 0; r < widths.length; r++) width = Math.max(width, widths[r]);
	for (let r = 0; r < widths.length; r++) {
		if (r > rows.length) rows.push(Fragment.empty);
		if (widths[r] < width) {
			const empty = tableNodeTypes(schema).cell.createAndFill()!;
			const cells = [];
			for (let i = widths[r]; i < width; i++) {
				cells.push(empty);
			}
			rows[r] = rows[r].append(Fragment.from(cells));
		}
	}
	return { height: rows.length, width, rows };
}

export const fitSlice = (nodeType: NodeType, slice: Slice): Node => {
	const node = nodeType.createAndFill()!;
	const tr = new Transform(node).replace(0, node.content.size, slice);
	return tr.doc;
};

export const clipCells = (
	{ width, height, rows }: Area,
	newWidth: number,
	newHeight: number
): Area => {
	if (width != newWidth) {
		const added: number[] = [];
		const newRows: Fragment[] = [];
		for (let row = 0; row < rows.length; row++) {
			const frag = rows[row],
				cells = [];
			for (let col = added[row] || 0, i = 0; col < newWidth; i++) {
				let cell = frag.child(i % frag.childCount);
				if (col + cell.attrs.colspan > newWidth)
					cell = cell.type.createChecked(
						removeColSpan(
							cell.attrs as CellAttrs,
							cell.attrs.colspan,
							col + cell.attrs.colspan - newWidth
						),
						cell.content
					);
				cells.push(cell);
				col += cell.attrs.colspan;
				for (let j = 1; j < cell.attrs.rowspan; j++)
					added[row + j] = (added[row + j] || 0) + cell.attrs.colspan;
			}
			newRows.push(Fragment.from(cells));
		}
		rows = newRows;
		width = newWidth;
	}
	if (height != newHeight) {
		const newRows = [];
		for (let row = 0, i = 0; row < newHeight; row++, i++) {
			const cells = [],
				source = rows[i % height];
			for (let j = 0; j < source.childCount; j++) {
				let cell = source.child(j);
				if (row + cell.attrs.rowspan > newHeight)
					cell = cell.type.create(
						{
							...cell.attrs,
							rowspan: Math.max(1, newHeight - cell.attrs.rowspan)
						},
						cell.content
					);
				cells.push(cell);
			}
			newRows.push(Fragment.from(cells));
		}
		rows = newRows;
		height = newHeight;
	}

	return { width, height, rows };
};

function growTable(
	tr: Transaction,
	map: TableMap,
	table: Node,
	start: number,
	width: number,
	height: number,
	mapFrom: number
): boolean {
	const schema = tr.doc.type.schema;
	const types = tableNodeTypes(schema);
	let empty;
	let emptyHead;
	if (width > map.width) {
		for (let row = 0, rowEnd = 0; row < map.height; row++) {
			const rowNode = table.child(row);
			rowEnd += rowNode.nodeSize;
			const cells: Node[] = [];
			let add: Node;
			if (rowNode.lastChild == null || rowNode.lastChild.type == types.cell)
				add = empty || (empty = types.cell.createAndFill()!);
			else add = emptyHead || (emptyHead = types.headerCell.createAndFill()!);
			for (let i = map.width; i < width; i++) cells.push(add);
			tr.insert(tr.mapping.slice(mapFrom).map(rowEnd - 1 + start), cells);
		}
	}
	if (height > map.height) {
		const cells = [];
		for (
			let i = 0, start = (map.height - 1) * map.width;
			i < Math.max(map.width, width);
			i++
		) {
			const header =
				i >= map.width
					? false
					: table.nodeAt(map.map[start + i])!.type == types.headerCell;
			cells.push(
				header
					? emptyHead || (emptyHead = types.headerCell.createAndFill()!)
					: empty || (empty = types.cell.createAndFill()!)
			);
		}

		const emptyRow = types.row.create(null, Fragment.from(cells)),
			rows = [];
		for (let i = map.height; i < height; i++) rows.push(emptyRow);
		tr.insert(tr.mapping.slice(mapFrom).map(start + table.nodeSize - 2), rows);
	}
	return !!(empty || emptyHead);
}

function isolateHorizontal(
	tr: Transaction,
	map: TableMap,
	table: Node,
	start: number,
	left: number,
	right: number,
	top: number,
	mapFrom: number
): boolean {
	if (top == 0 || top == map.height) return false;
	let found = false;
	for (let col = left; col < right; col++) {
		const index = top * map.width + col,
			pos = map.map[index];
		if (map.map[index - map.width] == pos) {
			found = true;
			const cell = table.nodeAt(pos)!;
			const { top: cellTop, left: cellLeft } = map.findCell(pos);
			tr.setNodeMarkup(tr.mapping.slice(mapFrom).map(pos + start), null, {
				...cell.attrs,
				rowspan: top - cellTop
			});
			tr.insert(
				tr.mapping.slice(mapFrom).map(map.positionAt(top, cellLeft, table)),
				cell.type.createAndFill({
					...cell.attrs,
					rowspan: cellTop + cell.attrs.rowspan - top
				})!
			);
			col += cell.attrs.colspan - 1;
		}
	}
	return found;
}

function isolateVertical(
	tr: Transaction,
	map: TableMap,
	table: Node,
	start: number,
	top: number,
	bottom: number,
	left: number,
	mapFrom: number
): boolean {
	if (left == 0 || left == map.width) return false;
	let found = false;
	for (let row = top; row < bottom; row++) {
		const index = row * map.width + left,
			pos = map.map[index];
		if (map.map[index - 1] == pos) {
			found = true;
			const cell = table.nodeAt(pos)!;
			const cellLeft = map.colCount(pos);
			const updatePos = tr.mapping.slice(mapFrom).map(pos + start);
			tr.setNodeMarkup(
				updatePos,
				null,
				removeColSpan(
					cell.attrs as CellAttrs,
					left - cellLeft,
					cell.attrs.colspan - (left - cellLeft)
				)
			);
			tr.insert(
				updatePos + cell.nodeSize,
				cell.type.createAndFill(
					removeColSpan(cell.attrs as CellAttrs, 0, left - cellLeft)
				)!
			);
			row += cell.attrs.rowspan - 1;
		}
	}
	return found;
}

export const insertCells = (
	state: EditorState,
	dispatch: EditorView['dispatch'],
	tableStart: number,
	rect: Rect,
	cells: Area
) => {
	let table = tableStart ? state.doc.nodeAt(tableStart - 1) : state.doc;
	if (!table) throw new Error('No table found');
	let map = TableMap.get(table);
	const { top, left } = rect;
	const right = left + cells.width,
		bottom = top + cells.height;
	const tr = state.tr;
	let mapFrom = 0;
	function recomp() {
		table = tableStart ? tr.doc.nodeAt(tableStart - 1) : tr.doc;
		if (!table) throw new Error('No table found');
		map = TableMap.get(table);
		mapFrom = tr.mapping.maps.length;
	}

	if (growTable(tr, map, table, tableStart, right, bottom, mapFrom)) recomp();
	if (isolateHorizontal(tr, map, table, tableStart, left, right, top, mapFrom))
		recomp();
	if (
		isolateHorizontal(tr, map, table, tableStart, left, right, bottom, mapFrom)
	)
		recomp();
	if (isolateVertical(tr, map, table, tableStart, top, bottom, left, mapFrom))
		recomp();
	if (isolateVertical(tr, map, table, tableStart, top, bottom, right, mapFrom))
		recomp();

	for (let row = top; row < bottom; row++) {
		const from = map.positionAt(row, left, table),
			to = map.positionAt(row, right, table);
		tr.replace(
			tr.mapping.slice(mapFrom).map(from + tableStart),
			tr.mapping.slice(mapFrom).map(to + tableStart),
			new Slice(cells.rows[row - top], 0, 0)
		);
	}
	recomp();

	tr.setSelection(
		new CellSelection(
			tr.doc.resolve(tableStart + map.positionAt(top, left, table)),
			tr.doc.resolve(tableStart + map.positionAt(bottom - 1, right - 1, table))
		)
	);
	dispatch(tr);
};
