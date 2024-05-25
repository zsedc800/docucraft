import { Node } from 'prosemirror-model';
import ReactDOM from 'react-dom/client';
import { Decoration, DecorationSource, EditorView, NodeView, NodeViewConstructor } from 'prosemirror-view';
type GetPos = () => number | undefined;
export declare class CodeBlockView implements NodeView {
    name: string;
    view: EditorView;
    getPos: GetPos;
    unmount?: () => void;
    dom: HTMLElement;
    menu: HTMLElement;
    node: Node;
    root: ReactDOM.Root;
    contentDOM?: HTMLElement | null | undefined;
    constructor(...args: Parameters<NodeViewConstructor>);
    renderComponent(): void;
    update(node: Node, decorations: readonly Decoration[], innerDecorations: DecorationSource): boolean;
    destroy(): void;
}
export declare const CodeBlockViewConstructor: NodeViewConstructor;
export {};
