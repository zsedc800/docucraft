import { Attrs } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import { TableMap } from './tableMap';
import { TableView } from './tableView';
import { CellAttrs } from './interface';

export type ColumnResizingOptions = {
	handleWidth?: number;
	cellMinWidth?: number;
	lastColumnResizable?: boolean;
	View?: typeof TableView;
};

export type Dragging = {
	startX: number;
	startWidth: number;
	startY: number;
	startHeight: number;
};

export type Direction = 'vertical' | 'horizontal' | 'none';

let setDragging: Dragging | null = null,
	dragging = false,
	cellDOM: HTMLElement | null;

let cellPos = -1;

export function setResizingPos(pos = -1) {
	cellPos = pos;
}

export function setResizingCellDOM(dom: HTMLElement | null) {
	cellDOM = dom;
}

export function getResizingCellDOM() {
	return cellDOM;
}

export function getResizingPos() {
	return cellPos;
}

export function isResizing() {
	return dragging;
}

export function handleMouseDown(
	view: EditorView,
	event: MouseEvent,
	cellMinWidth: number,
	dir: Direction = 'vertical'
): boolean {
	const win = view.dom.ownerDocument.defaultView ?? window;
	const pos = cellPos;
	if (pos < 0 || dragging) return false;

	const cell = view.state.doc.nodeAt(pos)!;
	const width = currentColWidth(view, pos, cell.attrs);
	const height = currentRowHeight(view, pos);
	setDragging = {
		startX: event.clientX,
		startWidth: width,
		startY: event.clientY,
		startHeight: height
	};
	dragging = true;

	function finish(event: MouseEvent) {
		win.removeEventListener('mouseup', finish);
		win.removeEventListener('mousemove', move);
		if (dragging) {
			updateColumnWidth(
				view,
				pos!,
				draggedWidth(setDragging!, event, cellMinWidth)
			);
			dragging = false;
			setDragging = null;
		}
	}

	function move(event: MouseEvent): void {
		if (!event.which) return finish(event);
		if (!pos) return;
		if (dragging) {
			if (dir === 'vertical') {
				const dragged = draggedWidth(setDragging!, event, cellMinWidth);
				displayColumnWidth(view, pos, dragged, cellMinWidth);
			} else {
				const dragged = draggedHeight(setDragging!, event);
				displayRowHeight(view, pos, dragged);
			}
		}
	}

	win.addEventListener('mouseup', finish);
	win.addEventListener('mousemove', move);
	event.preventDefault();
	return true;
}

function currentColWidth(
	view: EditorView,
	cellPos: number,
	{ colspan, colwidth }: Attrs
): number {
	const width = colwidth && colwidth[colwidth.length - 1];
	if (width) return width;
	const dom = view.domAtPos(cellPos);
	const node = dom.node.childNodes[dom.offset] as HTMLElement;
	let domWidth = node.offsetWidth,
		parts = colspan;
	if (colwidth)
		for (let i = 0; i < colspan; i++)
			if (colwidth[i]) {
				domWidth -= colwidth[i];
				parts--;
			}
	return domWidth / parts;
}

function currentRowHeight(view: EditorView, cellPos: number) {
	const dom = view.domAtPos(cellPos).node as HTMLElement;

	return dom.offsetHeight;
}

function draggedWidth(
	dragging: Dragging,
	event: MouseEvent,
	cellMinWidth: number
): number {
	const offset = event.clientX - dragging.startX;
	return Math.max(cellMinWidth, dragging.startWidth + offset);
}

function draggedHeight(dragging: Dragging, event: MouseEvent) {
	const offset = event.clientY - dragging.startY;
	return dragging.startHeight + offset;
}

function updateColumnWidth(
	view: EditorView,
	cell: number,
	width: number
): void {
	const $cell = view.state.doc.resolve(cell);
	const table = $cell.node(-1),
		map = TableMap.get(table),
		start = $cell.start(-1);
	const col =
		map.colCount($cell.pos - start) + $cell.nodeAfter!.attrs.colspan - 1;
	const tr = view.state.tr;
	for (let row = 0; row < map.height; row++) {
		const mapIndex = row * map.width + col;
		// Rowspanning cell that has already been handled
		if (row && map.map[mapIndex] == map.map[mapIndex - map.width]) continue;
		const pos = map.map[mapIndex];
		const attrs = table.nodeAt(pos)!.attrs as CellAttrs;
		const index = attrs.colspan == 1 ? 0 : col - map.colCount(pos);
		if (attrs.colwidth && attrs.colwidth[index] == width) continue;
		const colwidth = attrs.colwidth
			? attrs.colwidth.slice()
			: zeroes(attrs.colspan);
		colwidth[index] = width;
		// tr.setNodeMarkup(start + pos, null, { ...attrs, colwidth: colwidth });
		tr.setNodeAttribute(start + pos, 'colwidth', colwidth);
	}
	if (tr.docChanged) view.dispatch(tr);
}

function displayColumnWidth(
	view: EditorView,
	cell: number,
	width: number,
	cellMinWidth: number
): void {
	const $cell = view.state.doc.resolve(cell);
	const table = $cell.node(-1),
		start = $cell.start(-1);
	const col =
		TableMap.get(table).colCount($cell.pos - start) +
		$cell.nodeAfter!.attrs.colspan -
		1;
	let dom: Node | null = view.domAtPos($cell.start(-1)).node;
	while (dom && dom.nodeName != 'TABLE') {
		dom = dom.parentNode;
	}
	if (!dom) return;

	const cols = table.attrs.cols.concat();
	cols[col] = { width };
	view.dispatch(view.state.tr.setNodeAttribute(start - 1, 'cols', cols));
}

function displayRowHeight(view: EditorView, cell: number, height: number) {
	const $cell = view.state.doc.resolve(cell);
	const tr = $cell.start();
	const dom = view.nodeDOM(tr - 1) as HTMLElement;
	dom.style.height = height + 'px';
}

function zeroes(n: number): 0[] {
	return Array(n).fill(0);
}
