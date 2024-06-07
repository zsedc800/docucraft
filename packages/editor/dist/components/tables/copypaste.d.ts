import { Fragment, Node, NodeType, Slice } from 'prosemirror-model';
import { Rect } from './tableMap';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
export type Area = {
    width: number;
    height: number;
    rows: Fragment[];
};
export declare const pastedCells: (slice: Slice) => Area | null;
export declare const fitSlice: (nodeType: NodeType, slice: Slice) => Node;
export declare const clipCells: ({ width, height, rows }: Area, newWidth: number, newHeight: number) => Area;
export declare const insertCells: (state: EditorState, dispatch: EditorView['dispatch'], tableStart: number, rect: Rect, cells: Area) => void;
