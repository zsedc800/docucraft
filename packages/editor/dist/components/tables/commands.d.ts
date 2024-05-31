import { Command, EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Rect, TableMap } from './tableMap';
import { Node } from 'prosemirror-model';
export declare const createTable: (rows: number, columns: number) => Command;
export declare function insertTable(state: EditorState, dispatch: EditorView['dispatch']): void;
export type TableRect = Rect & {
    tableStart: number;
    map: TableMap;
    table: Node;
};
export declare function selectedRect(state: EditorState): TableRect;
export declare function addColumn(tr: Transaction, { map, table, tableStart }: TableRect, col: number): Transaction;
export declare const addColumnBefore: Command;
export declare const addColumnAfter: Command;
