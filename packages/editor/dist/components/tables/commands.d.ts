import { Command, EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Rect, TableMap } from './tableMap';
import { Node } from 'prosemirror-model';
export declare const createTable: (rows: number, columns: number) => Command;
export declare function insertTable(state: EditorState, dispatch: EditorView['dispatch']): void;
export interface TableCtx {
    tableStart: number;
    map: TableMap;
    table: Node;
}
export type TableRect = Rect & TableCtx;
export declare function selectedRect(state: EditorState): TableRect;
export declare function addColumn(tr: Transaction, { map, table, tableStart }: TableCtx, col: number): Transaction;
export declare const addColumnBefore: Command;
export declare const addColumnAfter: Command;
export declare const addColumnAtEnd: (pos: number, view: EditorView) => void;
export declare const removeColumn: (tr: Transaction, { map, table, tableStart }: TableCtx, col: number) => Transaction;
export declare const deleteColumn: Command;
export declare const rowIsHeader: (map: TableMap, table: Node, row: number) => boolean;
export declare const addRow: (tr: Transaction, { map, table, tableStart }: TableCtx, row: number) => Transaction;
export declare const addRowBefore: Command;
export declare const addRowAfter: Command;
export declare const addRowAtEnd: (pos: number, view: EditorView) => void;
export declare const removeRow: (tr: Transaction, { map, table, tableStart }: TableCtx, row: number) => Transaction;
export declare const deleteRow: Command;
export declare const mergeCells: Command;
