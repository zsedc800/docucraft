import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
export interface MenuItemSpec {
    class?: string;
    label: string;
    handler: (props: {
        view: EditorView;
        state: EditorState;
        tr: Transaction;
        dispatch: EditorView['dispatch'];
    }, event: MouseEvent) => void;
    update?: (view: EditorView, state: EditorState, menu: HTMLElement) => void;
}
export declare class MenuItem {
    private view;
    private spec;
    dom: HTMLElement;
    constructor(view: EditorView, spec: MenuItemSpec);
    update(view: EditorView, state: EditorState): void;
}
