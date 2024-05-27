import { Node, NodeSpec } from 'prosemirror-model';
import { Command } from 'prosemirror-state';
import { Decoration, DecorationSource, EditorView, NodeView, NodeViewConstructor } from 'prosemirror-view';
import './style.scss';
export declare const taskItem: NodeSpec;
export declare const taskList: NodeSpec;
export declare const createTaskList: Command;
export declare class TaskItemView implements NodeView {
    node: Node;
    dom: HTMLElement;
    view: EditorView;
    contentDOM?: HTMLElement | null | undefined;
    constructor(...args: Parameters<NodeViewConstructor>);
    update(node: Node, decorations: readonly Decoration[], innerDecorations: DecorationSource): boolean;
}
export declare const TaskItemViewConstructor: (node: Node, view: EditorView, getPos: () => number | undefined, decorations: readonly Decoration[], innerDecorations: DecorationSource) => TaskItemView;
declare const _default: () => void;
export default _default;
