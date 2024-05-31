import { Node } from 'prosemirror-model';
import { EditorState, PluginKey, Transaction } from 'prosemirror-state';
export declare const fixTablesKey: PluginKey<{
    fixTables: boolean;
}>;
export declare function fixTables(state: EditorState, oldState?: EditorState): Transaction | undefined;
export declare function fixTable(state: EditorState, table: Node, tablePos: number, tr: Transaction | undefined): Transaction | undefined;
