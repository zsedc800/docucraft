import { Attrs, MarkType } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import { CSSProperties } from 'react';
export declare const setMark: (view: EditorView, markType: MarkType | string, attrs?: Attrs | null) => boolean;
export declare const unSetMark: (view: EditorView, markType: MarkType | string) => void;
export declare const applyBold: (view: EditorView) => boolean | void;
export declare const applyUnderline: (view: EditorView) => boolean | void;
export declare const applyLinethrough: (view: EditorView) => boolean | void;
export declare const applylink: (url: string) => (view: EditorView) => boolean;
export declare const applyStyle: (style: CSSProperties) => ({ state, dispatch }: EditorView) => boolean;
export declare const applyColor: (color?: string) => ({ state, dispatch }: EditorView) => boolean;
export declare const applyBgColor: (backgroundColor?: string) => ({ state, dispatch }: EditorView) => boolean;
