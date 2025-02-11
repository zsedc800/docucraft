import { Decoration, DecorationSet } from 'prosemirror-view';
import type { TableMap } from './tableMap';
import { Node } from 'prosemirror-model';
export interface TableCtx {
	tableStart: number;
	map: TableMap;
	table: Node;
}

export type TableRect = Rect & TableCtx;

export type ColWidths = number[];

export interface Rect {
	left: number;
	top: number;
	right: number;
	bottom: number;
}

export type Problem =
	| {
			type: 'colwidth mismatch';
			pos: number;
			colwidth: ColWidths;
	  }
	| {
			type: 'collision';
			pos: number;
			row: number;
			n: number;
	  }
	| {
			type: 'missing';
			row: number;
			n: number;
	  }
	| {
			type: 'overlong_rowspan';
			pos: number;
			n: number;
	  };

export type TableRole = 'table' | 'row' | 'cell' | 'headerCell';
export type MergeCellStatus = 'hasMerged' | 'onlyMerged' | 'none';

export interface TableState {
	decorations: DecorationSet;
	set: number | null;
	hoverDecos?: Decoration[];
	cellDecos?: Decoration[];
}

export interface CellAttrs {
	colspan: number;
	rowspan: number;
	colwidth: number[] | null;
}

export type MutableAttrs = Record<string, unknown>;

export interface CellSelectionJSON {
	type: string;
	anchor: number;
	head: number;
}
