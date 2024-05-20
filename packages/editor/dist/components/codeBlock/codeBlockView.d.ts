import { Node } from 'prosemirror-model';
import { Decoration, DecorationSource, NodeView, NodeViewConstructor } from 'prosemirror-view';
export declare class CodeBlockView implements NodeView {
    name: string;
    private view;
    private getPos;
    dom: HTMLElement;
    node: Node;
    contentDOM?: HTMLElement | null | undefined;
    constructor(...args: Parameters<NodeViewConstructor>);
    update(node: Node, decorations: readonly Decoration[], innerDecorations: DecorationSource): boolean;
    private renderUI;
    private updateUI;
}
export declare const CodeBlockViewConstructor: NodeViewConstructor;
