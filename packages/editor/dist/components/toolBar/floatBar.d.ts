import { EditorState, PluginView } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { MenuItem, MenuItemSpec } from './menuItem';
interface Spec {
    class?: string;
    menus: MenuItemSpec[];
}
export declare class FloatBar implements PluginView {
    dom: HTMLElement;
    menus: MenuItem[];
    constructor(view: EditorView, spec: Spec);
    update(view: EditorView, state: EditorState): void;
    destroy(): void;
}
export {};
