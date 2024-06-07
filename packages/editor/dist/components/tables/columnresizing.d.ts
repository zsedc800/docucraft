import { EditorState, Plugin, PluginKey, Transaction } from 'prosemirror-state';
import { DecorationSet } from 'prosemirror-view';
import { TableView } from './tableView';
/**
 * @public
 */
export declare const columnResizingPluginKey: PluginKey<ResizeState>;
/**
 * @public
 */
export type ColumnResizingOptions = {
    handleWidth?: number;
    cellMinWidth?: number;
    lastColumnResizable?: boolean;
    View?: typeof TableView;
};
/**
 * @public
 */
export type Dragging = {
    startX: number;
    startWidth: number;
};
/**
 * @public
 */
export declare function columnResizing({ handleWidth, cellMinWidth, View, lastColumnResizable }?: ColumnResizingOptions): Plugin;
/**
 * @public
 */
export declare class ResizeState {
    activeHandle: number;
    dragging: Dragging | false;
    constructor(activeHandle: number, dragging: Dragging | false);
    apply(tr: Transaction): ResizeState;
}
export declare function handleDecorations(state: EditorState, cell: number): DecorationSet;
