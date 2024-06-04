import { EditorView } from 'prosemirror-view';
export declare function handleMouseDown(view: EditorView, startEvent: MouseEvent): void;
export declare function domInCell(view: EditorView, dom: Node | null): Node | null;
export declare const handleTripleClick: (view: EditorView, pos: number) => boolean;
export declare const handleKeyDown: () => void;
export declare const handlePaste: () => void;
