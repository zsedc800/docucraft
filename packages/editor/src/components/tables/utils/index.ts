import { PluginKey } from 'prosemirror-state';
import { Schema } from 'prosemirror-model';
import { NodeType, Node } from 'prosemirror-model';
import { Attrs } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { ResolvedPos } from 'prosemirror-model';
import { Transaction } from 'prosemirror-state';
import { CellAttrs, TableRect, TableRole, TableState } from '../interface';
import { createNodeAndFill } from '../../../commands';

export * from './consts';

export const tableEditingKey = new PluginKey<TableState>('selectingCells');
export function tableNodeTypes(schema: Schema): Record<TableRole, NodeType> {
	let result = schema.cached.tableNodeTypes;
	if (!result) {
		result = schema.cached.tableNodeTypes = {};
		for (const name in schema.nodes) {
			const type = schema.nodes[name];
			let role = type.spec.tableRole;
			if (role) result[role] = type;
		}
	}
	return result;
}

export const addColspan = (attrs: CellAttrs, pos: number, n = 1): Attrs => {
	const result = { ...attrs, colspan: attrs.colspan + n };
	// if (result.colwidth) {
	// 	result.colwidth = result.colwidth.slice();
	// 	for (let i = 0; i < n; i++) result.colwidth.splice(pos, 0, 0);
	// }
	return result;
};

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

export function cellWrapping($pos: ResolvedPos) {
	for (let d = $pos.depth; d > 0; d--) {
		const role = $pos.node(d).type.spec.tableRole;
		if (role === 'cell' || role === 'headerCell') return $pos.node(d);
	}
	return null;
}

export const splitCellOneWithType =
	(ctx: {
		getCellType: (e: { node: Node; row: number; col: number }) => NodeType;
		lastCell: number;
		tr: Transaction;
	}) =>
	(
		cellNode: Node | null,
		cellPos: number | undefined | null,
		rect: TableRect
	) => {
		if (cellNode == null || cellPos == null) {
			return false;
		}
		if (cellNode.attrs.colspan == 1 && cellNode.attrs.rowspan == 1) {
			return false;
		}

		let baseAttrs = cellNode.attrs;
		const attrs: any[] = [];
		const colwidth = baseAttrs.colwidth;
		if (baseAttrs.rowspan > 1) baseAttrs = { ...baseAttrs, rowspan: 1 };
		if (baseAttrs.colspan > 1) baseAttrs = { ...baseAttrs, colspan: 1 };

		const { tr } = ctx,
			{ map, tableStart } = rect;
		for (let i = 0; i < rect.right - rect.left; i++)
			attrs.push(
				colwidth
					? {
							...baseAttrs,
							colwidth: colwidth && colwidth[i] ? [colwidth[i]] : null
						}
					: baseAttrs
			);
		let { getCellType, lastCell } = ctx;

		// mark

		for (let row = rect.top; row < rect.bottom; row++) {
			let pos = map.positionAt(row, rect.left, rect.table);
			if (row == rect.top) pos += cellNode.nodeSize;
			for (let col = rect.left, i = 0; col < rect.right; col++, i++) {
				if (col == rect.left && row == rect.top) continue;
				const cellType = getCellType({ node: cellNode, row, col });
				tr.insert(
					(lastCell = tr.mapping.map(pos + tableStart, 1)),
					createNodeAndFill(cellType, attrs[i])!
				);
			}
		}
		ctx.tr = tr.setNodeMarkup(
			cellPos,
			getCellType({ node: cellNode, row: rect.top, col: rect.left }),
			attrs[0]
		);
		ctx.lastCell = lastCell;
	};

export function removeColSpan(attrs: CellAttrs, pos: number, n = 1): CellAttrs {
	const result: CellAttrs = { ...attrs, colspan: attrs.colspan - n };

	if (result.colwidth) {
		result.colwidth = result.colwidth.slice();
		result.colwidth.splice(pos, n);
		if (!result.colwidth.some((w) => w > 0)) result.colwidth = null;
	}
	return result;
}

export const isEmpty = (val: unknown) =>
	val === null || val === undefined || Number.isNaN(val);
