import { Command, EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
export declare const createTable: (rows: number, columns: number) => Command;
export declare function insertTable(state: EditorState, dispatch: EditorView['dispatch']): void;
