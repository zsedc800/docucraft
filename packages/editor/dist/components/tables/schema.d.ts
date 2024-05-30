import { NodeSpec, NodeType, Schema } from 'prosemirror-model';
import { MutableAttrs } from './utils';
export type getFromDOM = (dom: HTMLElement) => unknown;
export type setDOMAttr = (value: unknown, attrs: MutableAttrs) => void;
export interface CellAttributes {
    default: unknown;
    getFromDOM?: getFromDOM;
    setDOMAttr?: setDOMAttr;
}
export interface TableNodesOptions {
    tableGroup?: string;
    cellContent: string;
    cellAttributes: {
        [k: string]: CellAttributes;
    };
}
export type TableNodes = Record<'table' | 'tableRow' | 'tableCell' | 'tableHeader', NodeSpec>;
export declare const tableNodes: (options: TableNodesOptions) => TableNodes;
export type TableRole = 'table' | 'row' | 'cel' | 'headerCell';
export declare function tableNodeTypes(schema: Schema): Record<TableRole, NodeType>;
