import { Attrs, Node, ResolvedPos } from 'prosemirror-model';
import { TableMap } from './tableMap';
import { EditorState, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
export interface TableState {
    decorations: DecorationSet;
    set: number | null;
    hoverDecos?: Decoration[];
}
export declare const tableEditingKey: PluginKey<TableState>;
export interface CellAttrs {
    colspan: number;
    rowspan: number;
    colwidth: number[] | null;
}
export type MutableAttrs = Record<string, unknown>;
export declare const addColspan: (attrs: CellAttrs, pos: number, n?: number) => Attrs;
export declare function columnIsHeader(map: TableMap, table: Node, col: number): boolean;
export declare function isInTable(state: EditorState): boolean;
export declare function pointsAtCell($pos: ResolvedPos): boolean;
export declare function inSameTable($cellA: ResolvedPos, $cellB: ResolvedPos): boolean;
export declare function colCount($pos: ResolvedPos): number;
export declare function nextCell($pos: ResolvedPos, axis: 'horiz' | 'vert', dir: number): ResolvedPos | null;
export declare function removeColSpan(attrs: CellAttrs, pos: number, n?: number): CellAttrs;
export declare function cellAround($pos: ResolvedPos): ResolvedPos | null;
export declare function moveCellForward($pos: ResolvedPos): ResolvedPos;
export declare function cellNear($pos: ResolvedPos): ResolvedPos | undefined;
export declare function selectionCell(state: EditorState): ResolvedPos;
export declare const isEmpty: (val: unknown) => boolean;
