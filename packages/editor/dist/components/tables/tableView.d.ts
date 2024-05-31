import { Node } from 'prosemirror-model';
import { NodeView } from 'prosemirror-view';
export declare class TableView implements NodeView {
    node: Node;
    cellMinWidth: number;
    dom: HTMLDivElement;
    table: HTMLTableElement;
    colgroup: HTMLTableColElement;
    contentDOM: HTMLTableSectionElement;
    constructor(node: Node, cellMinWidth: number);
    update(node: Node): boolean;
    ignoreMutation(record: MutationRecord): boolean;
    selectNode(): void;
}
export declare function updateColumnsOnResize(node: Node, colgroup: HTMLTableColElement, table: HTMLTableElement, cellMinWidth: number, overrideCol?: number, overrideValue?: number): void;
