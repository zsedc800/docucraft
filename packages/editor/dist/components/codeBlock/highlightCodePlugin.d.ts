import { Node, NodeType } from 'prosemirror-model';
import { PluginKey, Plugin } from 'prosemirror-state';
import { DecorationSet } from 'prosemirror-view';
interface HighlightCodePluginState {
    decorations: DecorationSet;
}
export interface NodeWithPos {
    node: Node;
    pos: number;
}
export declare const highlightCodePluginKey: PluginKey<HighlightCodePluginState>;
export declare function findNodesByType(doc: Node, type: string | string[] | NodeType | NodeType[]): NodeWithPos[];
export declare function highlightCodePlugin(): Plugin<{
    decorations: DecorationSet;
}>;
export {};
