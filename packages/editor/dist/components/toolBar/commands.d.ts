import { Attrs, MarkType } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
export declare const setMark: (view: EditorView, markType: MarkType | string, attrs?: Attrs | null) => boolean;
export declare const unSetMark: (view: EditorView, markType: MarkType) => void;
export declare const setBold: (view: EditorView) => boolean;
export declare const addLink: (view: EditorView) => boolean;
