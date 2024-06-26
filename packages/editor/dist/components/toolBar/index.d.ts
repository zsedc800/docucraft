import { EditorState, PluginView } from 'prosemirror-state';
import { MenuGroupSpec } from './menuGroup';
import { EditorView } from 'prosemirror-view';
export interface ToolBarSpec {
    groups: MenuGroupSpec[];
    class?: string;
}
export declare class ToolBar implements PluginView {
    private view;
    private spec;
    dom: HTMLElement;
    private groups;
    constructor(view: EditorView, spec: ToolBarSpec);
    render(): void;
    update(view: EditorView, state: EditorState): void;
    destroy(): void;
}
