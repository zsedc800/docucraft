import { Node } from 'prosemirror-model';
export interface Rect {
    left: number;
    top: number;
    right: number;
    bottom: number;
}
export type Problem = {
    type: 'colwidth mismatch';
    pos: number;
    colwidth: ColWidths;
} | {
    type: 'collision';
    pos: number;
    row: number;
    n: number;
} | {
    type: 'missing';
    row: number;
    n: number;
} | {
    type: 'overlong_rowspan';
    pos: number;
    n: number;
};
export declare class TableMap {
    width: number;
    height: number;
    map: number[];
    problems: Problem[];
    constructor(width: number, height: number, map: number[], problems?: Problem[]);
    rectBetween(a: number, b: number): Rect;
    findCell(pos: number): Rect;
    nextCell(pos: number, axis: 'horiz' | 'vert', dir: number): number | null;
    colCount(pos: number): number;
    cellsInRect(rect: Rect): number[];
    positionAt(row: number, col: number, table: Node): number;
    static get(table: Node): TableMap;
}
export type ColWidths = number[];
