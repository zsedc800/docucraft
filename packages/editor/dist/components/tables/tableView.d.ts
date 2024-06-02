import { Node } from 'prosemirror-model';
import { Decoration, EditorView, NodeView, NodeViewConstructor } from 'prosemirror-view';
export declare class TableView implements NodeView {
    node: Node;
    view: EditorView;
    private getPos;
    cellMinWidth: number;
    dom: HTMLDivElement;
    table: HTMLTableElement;
    colgroup: HTMLTableColElement;
    contentDOM: HTMLTableSectionElement;
    private $cell?;
    constructor(node: Node, view: EditorView, getPos: () => number | undefined, cellMinWidth: number);
    handleMouseOver: (event: MouseEvent) => void;
    handleMouseLeave: () => void;
    destroy(): void;
    update(node: Node, decorations: readonly Decoration[]): boolean;
    ignoreMutation(record: MutationRecord): boolean;
    selectNode(): void;
}
export declare function updateColumnsOnResize(node: Node, colgroup: HTMLTableColElement, table: HTMLTableElement, cellMinWidth: number, overrideCol?: number, overrideValue?: number): void;
export declare const TableViewConstructor: NodeViewConstructor;
export declare const addToolkit: (table: Node, start: number) => Decoration[];
