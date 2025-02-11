import { ResolvedPos, Node } from 'prosemirror-model';
import { TableMap } from './tableMap';
import { tableNodeTypes } from '../utils';

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

export { TableMap };
