import { Node, ResolvedPos, Slice } from 'prosemirror-model';
import { EditorState, Selection, Transaction } from 'prosemirror-state';
import { Mappable } from 'prosemirror-transform';
import { DecorationSource } from 'prosemirror-view';
export interface CellSelectionJSON {
    type: string;
    anchor: number;
    head: number;
}
export declare class CellSelection extends Selection {
    $anchorCell: ResolvedPos;
    $headCell: ResolvedPos;
    constructor($anchorCell: ResolvedPos, $headCell?: ResolvedPos);
    eq(selection: unknown): boolean;
    map(doc: Node, mapping: Mappable): CellSelection | Selection;
    toJSON(): {
        type: string;
        anchor: number;
        head: number;
    };
    isRowSelection(): boolean;
    isColSelection(): boolean;
    static colSelection($anchorCell: ResolvedPos, $headCell?: ResolvedPos): CellSelection;
    forEachCell(f: (node: Node, pos: number) => void): void;
    content(): Slice;
    static rowSelection($anchorCell: ResolvedPos, $headCell?: ResolvedPos): CellSelection;
    static fromJSON(doc: Node, json: CellSelectionJSON): CellSelection;
    static create(doc: Node, anchorCell: number, headCell?: number): CellSelection;
    getBookmark(): CellBookmark;
}
export declare class CellBookmark {
    anchor: number;
    head: number;
    constructor(anchor: number, head: number);
    map(mapping: Mappable): CellBookmark;
    resolve(doc: Node): CellSelection | Selection;
}
export declare function drawCellSelection(state: EditorState): DecorationSource | null;
export declare function normalizeSelection(state: EditorState, tr: Transaction | undefined, allowTableNodeSelection: boolean): Transaction | undefined;
