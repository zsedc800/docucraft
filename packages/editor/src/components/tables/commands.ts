import {
	Command,
	EditorState,
	TextSelection,
	Transaction
} from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Rect, TableMap } from './tableMap';
import { Fragment, Node, NodeType, ResolvedPos } from 'prosemirror-model';
import {
	CellAttrs,
	addColspan,
	columnIsHeader,
	isInTable,
	moveCellForward,
	removeColSpan,
	selectionCell
} from './utils';
import { CellAttributes, tableNodeTypes } from './schema';
import { CellSelection } from './cellSelection';
import { Direction } from './input';
export const createTable: (rows: number, columns: number) => Command =
	(rows, columns) => (state, dispatch, view) => {
		const { table, tableRow, tableHeader, tableCell, paragraph } =
			state.schema.nodes;

		const tableNode = table.create(
			null,
			Array(rows + 1)
				.fill(null)
				.map((_, row) =>
					tableRow.create(
						null,
						Array(columns)
							.fill(null)
							.map((_, col) =>
								(row === 0 ? tableHeader : tableCell).create(
									null,
									paragraph.create(
										null
										// state.schema.text('cell row ' + row + ', col ' + col)
									)
								)
							)
					)
				)
		);
		TableMap.get(tableNode);
		if (dispatch) {
			dispatch(state.tr.replaceSelectionWith(tableNode).scrollIntoView());
			return true;
		}

		return false;
	};

export function insertTable(
	state: EditorState,
	dispatch: EditorView['dispatch']
) {
	const { schema } = state;
	const table = schema.nodes.table;
	const row = schema.nodes.table_row;
	const cell = schema.nodes.table_cell;
	const paragraph = schema.nodes.paragraph;
	const tableNode = table.create(
		null,
		Array(3)
			.fill(null)
			.map((_, r) =>
				row.create(
					null,
					Array(3)
						.fill(null)
						.map((_, col) =>
							cell.create(
								null,
								paragraph.create(
									null,
									schema.text(`hello row ${r + 1} col ${col + 1}`)
								)
							)
						)
				)
			)
	);
	dispatch(state.tr.replaceSelectionWith(tableNode).scrollIntoView());
}

export interface TableCtx {
	tableStart: number;
	map: TableMap;
	table: Node;
}
export type TableRect = Rect & TableCtx;

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

export function addColumn(
	tr: Transaction,
	{ map, table, tableStart }: TableCtx,
	col: number
) {
	let refColumn: number | null = col > 0 ? -1 : 0;
	if (columnIsHeader(map, table, col + refColumn)) {
		refColumn = col == 0 || col == map.width ? null : 0;
	}

	for (let row = 0; row < map.height; row++) {
		const index = row * map.width + col;
		if (col > 0 && col < map.width && map.map[index - 1] == map.map[index]) {
			const pos = map.map[index];
			const cell = table.nodeAt(pos)!;
			tr.setNodeMarkup(
				tr.mapping.map(tableStart + pos),
				null,
				addColspan(cell.attrs as CellAttrs, col - map.colCount(pos))
			);
			row += cell.attrs.rowspan - 1;
		} else {
			const type =
				refColumn == null
					? tableNodeTypes(table.type.schema).cell
					: table.nodeAt(map.map[index + refColumn])!.type;
			const pos = map.positionAt(row, col, table);
			tr.insert(tr.mapping.map(tableStart + pos), type.createAndFill()!);
		}
	}
	return tr;
}

export const addColumnBefore: Command = (state, dispatch) => {
	if (!isInTable(state)) return false;
	if (dispatch) {
		const rect = selectedRect(state);
		dispatch(addColumn(state.tr, rect, rect.left));
	}
	return true;
};

export const addColumnAfter: Command = (state, dispatch) => {
	if (!isInTable(state)) return false;
	if (dispatch) {
		const rect = selectedRect(state);
		dispatch(addColumn(state.tr, rect, rect.right));
	}
	return true;
};

export const addColumnAtEnd = (pos: number, view: EditorView) => {
	const { state, dispatch } = view;
	let tr = state.tr;
	const tableStart = tr.mapping.map(pos);
	const $start = state.doc.resolve(tableStart);
	const table = $start.nodeAfter!;
	// console.log($start);
	// console.log($start.node($start.depth), 'nn');

	const map = TableMap.get(table);
	dispatch(addColumn(tr, { map, table, tableStart: pos + 1 }, map.width));
};

export const removeColumn = (
	tr: Transaction,
	{ map, table, tableStart }: TableCtx,
	col: number
): Transaction => {
	const mapStart = tr.mapping.maps.length;
	for (let row = 0; row < map.height; ) {
		const index = row * map.width + col;
		const pos = map.map[index];
		const cell = table.nodeAt(pos)!;
		const attrs = cell.attrs as CellAttrs;

		if (
			(col > 0 && map.map[index - 1] == pos) ||
			(col < map.width - 1 && map.map[index + 1] == pos)
		) {
			tr.setNodeMarkup(
				tr.mapping.slice(mapStart).map(tableStart + pos),
				null,
				removeColSpan(attrs, col - map.colCount(pos))
			);
		} else {
			const start = tr.mapping.slice(mapStart).map(tableStart + pos);
			tr.delete(start, start + cell.nodeSize);
		}
		row += attrs.rowspan;
	}
	return tr;
};

export const deleteColumn: Command = (state, dispatch) => {
	if (isInTable(state)) return false;
	if (dispatch) {
		const rect = selectedRect(state);
		const tr = state.tr;
		if (rect.left == 0 && rect.right == rect.map.width) return false;
		for (let i = rect.right - 1; ; i--) {
			removeColumn(tr, rect, i);
			if (i == rect.left) break;
			const table = rect.tableStart
				? tr.doc.nodeAt(rect.tableStart - 1)
				: tr.doc;
			if (!table) throw new RangeError('No table found');
			rect.table = table;
			rect.map = TableMap.get(table);
		}
		dispatch(tr);
	}
	return true;
};

export const rowIsHeader = (
	map: TableMap,
	table: Node,
	row: number
): boolean => {
	const headerCell = tableNodeTypes(table.type.schema).headerCell;
	for (let col = 0; col < map.width; col++)
		if (table.nodeAt(map.map[col + row * map.width])?.type != headerCell)
			return false;

	return true;
};

export const addRow = (
	tr: Transaction,
	{ map, table, tableStart }: TableCtx,
	row: number
): Transaction => {
	let rowPos = tableStart;
	for (let i = 0; i < row; i++) rowPos += table.child(i).nodeSize;
	const cells = [];
	let refRow: number | null = row > 0 ? -1 : 0;

	if (rowIsHeader(map, table, row + refRow))
		refRow = row == 0 || row == map.height ? null : 0;

	for (let col = 0, index = map.width * row; col < map.width; col++, index++) {
		if (
			row > 0 &&
			row < map.height &&
			map.map[index] == map.map[index - map.width]
		) {
			const pos = map.map[index];
			const attrs = table.nodeAt(pos)!.attrs;
			tr.setNodeMarkup(tableStart + pos, null, {
				...attrs,
				rowspan: attrs.rowspan + 1
			});
			col += attrs.colspan - 1;
		} else {
			const type =
				refRow === null
					? tableNodeTypes(table.type.schema).cell
					: table.nodeAt(map.map[index + refRow * map.width])?.type;
			const node = type?.createAndFill();
			if (node) cells.push(node);
		}
	}
	tr.insert(rowPos, tableNodeTypes(table.type.schema).row.create(null, cells));
	return tr;
};

export const addRowBefore: Command = (state, dispatch) => {
	if (!isInTable(state)) return false;
	if (dispatch) {
		const rect = selectedRect(state);
		dispatch(addRow(state.tr, rect, rect.top));
	}
	return true;
};

export const addRowAfter: Command = (state, dispatch) => {
	if (!isInTable(state)) return false;
	if (dispatch) {
		const rect = selectedRect(state);
		dispatch(addRow(state.tr, rect, rect.bottom));
	}
	return true;
};

export const addRowAtEnd = (pos: number, view: EditorView) => {
	const $pos = view.state.doc.resolve(pos);
	const table = $pos.nodeAfter!;
	const map = TableMap.get(table);
	view.dispatch(
		addRow(view.state.tr, { map, table, tableStart: pos + 1 }, map.height)
	);
};

export const removeRow = (
	tr: Transaction,
	{ map, table, tableStart }: TableCtx,
	row: number
) => {
	let rowPos = 0;
	for (let i = 0; i < row; i++) rowPos += table.child(i).nodeSize;
	const nextRow = rowPos + table.child(row).nodeSize;
	const mapFrom = tr.mapping.maps.length;
	tr.delete(rowPos + tableStart, nextRow + tableStart);

	const seen = new Set<number>();

	for (let col = 0, index = row * map.width; col < map.width; col++, index++) {
		const pos = map.map[index];

		if (seen.has(pos)) continue;

		seen.add(pos);
		if (row > 0 && pos == map.map[index - map.width]) {
			const attrs = table.nodeAt(pos)?.attrs as CellAttrs;
			tr.setNodeMarkup(tr.mapping.slice(mapFrom).map(pos + tableStart), null, {
				...attrs,
				rowspan: attrs.rowspan - 1
			});
			col += attrs.colspan - 1;
		} else if (row < map.height && pos == map.map[index + map.width]) {
			const cell = table.nodeAt(pos)!;
			const attrs = cell?.attrs as CellAttrs;
			const copy = cell.type.create(
				{ ...attrs, rowspan: cell.attrs.rowspan - 1 },
				cell.content
			);
			const newPos = map.positionAt(row + 1, col, table);
			tr.insert(tr.mapping.slice(mapFrom).map(tableStart + newPos), copy);
			col += attrs.colspan - 1;
		}
	}
	return tr;
};

export const deleteRow: Command = (state, dispatch) => {
	if (!isInTable(state)) return false;
	if (dispatch) {
		const rect = selectedRect(state),
			tr = state.tr;
		if (rect.top == 0 && rect.bottom == rect.map.height) return false;
		for (let i = rect.bottom - 1; ; i--) {
			removeRow(tr, rect, i);
			if (i == rect.top) break;
			const table = rect.tableStart
				? tr.doc.nodeAt(rect.tableStart - 1)
				: tr.doc;
			if (!table) throw new RangeError('No table found');
			rect.table = table;
			rect.map = TableMap.get(table);
		}
		dispatch(tr);
	}
	return true;
};

const cellsOverlapRectangle = (
	{ width, height, map }: TableMap,
	rect: Rect
): boolean => {
	let indexTop = rect.top * width + rect.left,
		indexLeft = indexTop;

	let indexBottom = (rect.bottom - 1) * width + rect.left,
		indexRight = indexTop + (rect.right - rect.left - 1);

	for (let i = rect.top; i < rect.bottom; i++) {
		if (
			(rect.left > 0 && map[indexLeft] == map[indexLeft - 1]) ||
			(rect.right < width && map[indexRight] == map[indexRight + 1])
		)
			return true;
		indexLeft += width;
		indexRight += width;
	}
	for (let i = rect.left; i < rect.right; i++) {
		if (
			(rect.top > 0 && map[indexTop] == map[indexTop - width]) ||
			(rect.bottom < height && map[indexBottom] == map[indexBottom + width])
		)
			return true;

		indexTop++;
		indexBottom++;
	}
	return false;
};

const isEmpty = (cell: Node): Boolean => {
	const c = cell.content;
	return (
		c.childCount == 1 && c.child(0).isTextblock && c.child(0).childCount == 0
	);
};

export const mergeCells: Command = (state, dispatch) => {
	const sel = state.selection;
	if (
		!(sel instanceof CellSelection) ||
		sel.$anchorCell.pos == sel.$headCell.pos
	)
		return false;

	const rect = selectedRect(state),
		{ map } = rect;
	if (cellsOverlapRectangle(map, rect)) return false;

	if (dispatch) {
		const tr = state.tr;
		const seen: Record<number, boolean> = {};
		let content = Fragment.empty;
		let mergedPos: number | undefined;
		let mergedCell: Node | undefined;
		for (let row = rect.top; row < rect.bottom; row++) {
			for (let col = rect.left; col < rect.right; col++) {
				const cellPos = map.map[row * map.width + col];
				const cell = rect.table.nodeAt(cellPos);
				if (seen[cellPos] || !cell) continue;
				seen[cellPos] = true;
				if (mergedPos == null) {
					mergedPos = cellPos;
					mergedCell = cell;
				} else {
					if (!isEmpty(cell)) content = content.append(cell.content);
					const mapped = tr.mapping.map(cellPos + rect.tableStart);
					tr.delete(mapped, mapped + cell.nodeSize);
				}
			}
		}
		if (mergedPos == null || mergedCell == null) return true;

		tr.setNodeMarkup(mergedPos + rect.tableStart, null, {
			...addColspan(
				mergedCell.attrs as CellAttrs,
				mergedCell.attrs.colspan,
				rect.right - rect.left - mergedCell.attrs.colspan
			),
			rowspan: rect.bottom - rect.top
		});
		if (content.size) {
			const end = mergedPos + 1 + mergedCell.content.size;
			const start = isEmpty(mergedCell) ? mergedPos + 1 : end;
			tr.replaceWith(start + rect.tableStart, end + rect.tableStart, content);
		}
		tr.setSelection(
			new CellSelection(tr.doc.resolve(mergedPos + rect.tableStart))
		);
		dispatch(tr);
	}

	return true;
};

export const setCellAttrs =
	(name: string, value: unknown): Command =>
	(state, dispatch) => {
		if (!isInTable(state)) return false;
		const $cell = selectionCell(state);
		if ($cell.nodeAfter!.attrs[name] === value) return false;
		if (dispatch) {
			const tr = state.tr;
			if (state.selection instanceof CellSelection)
				state.selection.forEachCell((node, pos) => {
					if (node.attrs[name] !== value)
						tr.setNodeMarkup(pos, null, {
							...node.attrs,
							[name]: value
						});
				});
			else
				tr.setNodeMarkup($cell.pos, null, {
					...$cell.nodeAfter!.attrs,
					[name]: value
				});
			dispatch(tr);
		}

		return true;
	};

function isHeaderEnabledByType(
	type: 'row' | 'column',
	rect: TableRect,
	types: Record<string, NodeType>
): boolean {
	// Get cell positions for first row or first column
	const cellPositions = rect.map.cellsInRect({
		left: 0,
		top: 0,
		right: type == 'row' ? rect.map.width : 1,
		bottom: type == 'column' ? rect.map.height : 1
	});

	for (let i = 0; i < cellPositions.length; i++) {
		const cell = rect.table.nodeAt(cellPositions[i]);
		if (cell && cell.type !== types.header_cell) {
			return false;
		}
	}

	return true;
}

export type ToggleHeaderType = 'column' | 'row' | 'cell';

export function toggleHeader(
	type: ToggleHeaderType,
	options?: { useDeprecatedLogic: boolean } | undefined
): Command {
	options = options || { useDeprecatedLogic: false };

	// if (options.useDeprecatedLogic) return deprecated_toggleHeader(type);

	return function (state, dispatch) {
		if (!isInTable(state)) return false;
		if (dispatch) {
			const types = tableNodeTypes(state.schema);
			const rect = selectedRect(state),
				tr = state.tr;

			const isHeaderRowEnabled = isHeaderEnabledByType('row', rect, types);
			const isHeaderColumnEnabled = isHeaderEnabledByType(
				'column',
				rect,
				types
			);

			const isHeaderEnabled =
				type === 'column'
					? isHeaderRowEnabled
					: type === 'row'
						? isHeaderColumnEnabled
						: false;

			const selectionStartsAt = isHeaderEnabled ? 1 : 0;

			const cellsRect =
				type == 'column'
					? {
							left: 0,
							top: selectionStartsAt,
							right: 1,
							bottom: rect.map.height
						}
					: type == 'row'
						? {
								left: selectionStartsAt,
								top: 0,
								right: rect.map.width,
								bottom: 1
							}
						: rect;

			const newType =
				type == 'column'
					? isHeaderColumnEnabled
						? types.cell
						: types.headerCell
					: type == 'row'
						? isHeaderRowEnabled
							? types.cell
							: types.headerCell
						: types.cell;

			rect.map.cellsInRect(cellsRect).forEach((relativeCellPos) => {
				const cellPos = relativeCellPos + rect.tableStart;
				const cell = tr.doc.nodeAt(cellPos);

				if (cell) {
					tr.setNodeMarkup(cellPos, newType, cell.attrs);
				}
			});

			dispatch(tr);
		}
		return true;
	};
}

function findNextCell($cell: ResolvedPos, dir: Direction): number | null {
	if (dir < 0) {
		const before = $cell.nodeBefore;
		if (before) return $cell.pos - before.nodeSize;
		for (
			let row = $cell.index(-1) - 1, rowEnd = $cell.before();
			row >= 0;
			row--
		) {
			const rowNode = $cell.node(-1).child(row);
			const lastChild = rowNode.lastChild;
			if (lastChild) return rowEnd - 1 - lastChild.nodeSize;
			return (rowEnd -= rowNode.nodeSize);
		}
	} else {
		if ($cell.index() < $cell.parent.childCount - 1)
			return $cell.pos + $cell.nodeAfter!.nodeSize;
		const table = $cell.node(-1);
		for (
			let row = $cell.indexAfter(-1), rowStart = $cell.after();
			row < table.childCount;
			row++
		) {
			const rowNode = table.child(row);
			if (rowNode.childCount) return rowStart + 1;
			rowStart += rowNode.nodeSize;
		}
	}

	return null;
}

export const goToNextCell =
	(direction: Direction): Command =>
	(state, dispatch) => {
		if (!isInTable(state)) return false;
		const cell = findNextCell(selectionCell(state), direction);
		if (cell == null) return false;
		if (dispatch) {
			const $cell = state.doc.resolve(cell);
			dispatch(
				state.tr
					.setSelection(TextSelection.between($cell, moveCellForward($cell)))
					.scrollIntoView()
			);
		}
		return true;
	};

export const deleteTable: Command = (state, dispatch) => {
	const $pos = state.selection.$anchor;
	for (let d = $pos.depth; d > 0; d--) {
		const node = $pos.node(d);
		if (node.type.spec.tableRole == 'table') {
			if (dispatch) {
				dispatch(
					state.tr.delete($pos.before(d), $pos.after(d)).scrollIntoView()
				);
				return true;
			}
		}
	}
	return false;
};
