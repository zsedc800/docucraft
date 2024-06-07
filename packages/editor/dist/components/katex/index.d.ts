import 'katex/dist/katex.min.css';
import { NodeSpec } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
export declare const mathNodeSpec: NodeSpec;
export declare const mathRender: () => Plugin<any>;
export declare const insertMath: (view: EditorView, formula: string) => void;
