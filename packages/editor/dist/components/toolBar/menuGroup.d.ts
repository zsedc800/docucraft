import { EditorView } from 'prosemirror-view';
import { MenuItemSpec } from './menuItem';
import { EditorState } from 'prosemirror-state';
export interface MenuGroupSpec {
    name?: string;
    class?: string;
    menus: MenuItemSpec[];
}
export declare class MenuGroup {
    private view;
    private spec;
    dom: HTMLElement;
    private menus;
    constructor(view: EditorView, spec: MenuGroupSpec);
    update(view: EditorView, state: EditorState): void;
}
