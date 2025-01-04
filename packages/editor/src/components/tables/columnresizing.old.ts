import { Attrs } from 'prosemirror-model';
import { EditorState, Plugin, PluginKey, Transaction } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { TableMap } from './tableMap';
import { TableView } from './tableView';
import {
	cellAround,
	CellAttrs,
	pointsAtCell,
	cellMinWidth as cMinWidth
} from './utils';

/**
 * @public
 */
export const columnResizingPluginKey = new PluginKey<ResizeState>(
	'tableColumnResizing'
);

/**
 * @public
 */
export type ColumnResizingOptions = {
	handleWidth?: number;
	cellMinWidth?: number;
	lastColumnResizable?: boolean;
	View?: typeof TableView;
};

/**
 * @public
 */
export type Dragging = {
	startX: number;
	startWidth: number;
	startY: number;
	startHeight: number;
};

/**
 * @public
 */
export function columnResizing({
	handleWidth = 5,
	cellMinWidth = cMinWidth,
	View = TableView,
	lastColumnResizable = true
}: ColumnResizingOptions = {}): Plugin {
	const plugin = new Plugin<ResizeState>({
		key: columnResizingPluginKey,
		state: {
			init(_, state) {
				return new ResizeState(-1, false);
			},
			apply(tr, prev) {
				return prev.apply(tr);
			}
		},
		props: {
			attributes: (state): Record<string, string> => {
				const pluginState = columnResizingPluginKey.getState(state);
				return pluginState && pluginState.activeHandle > -1
					? {
							class:
								pluginState.dir === 'vertical'
									? 'column-resize-cursor'
									: 'row-resize-cursor'
						}
					: {};
			},

			handleDOMEvents: {
				mousemove: (view, event) => {
					handleMouseMove(
						view,
						event,
						handleWidth,
						cellMinWidth,
						lastColumnResizable
					);
				},
				mouseleave: (view) => {
					handleMouseLeave(view);
				},
				mousedown: (view, event) => {
					handleMouseDown(view, event, cellMinWidth);
				}
			},

			decorations: (state) => {
				const pluginState = columnResizingPluginKey.getState(state);
				if (pluginState && pluginState.activeHandle > -1) {
					return handleDecorations(
						state,
						pluginState.activeHandle,
						pluginState.dir
					);
				}
			},

			nodeViews: {}
		}
	});
	return plugin;
}

type Direction = 'vertical' | 'horizontal';

/**
 * @public
 */
export class ResizeState {
	constructor(
		public activeHandle: number,
		public dragging: Dragging | false,
		public dir: Direction = 'vertical'
	) {}

	apply(tr: Transaction): ResizeState {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const state = this;
		const action = tr.getMeta(columnResizingPluginKey);
		if (action && action.setHandle != null)
			return new ResizeState(
				action.setHandle,
				false,
				action.dir ? action.dir : void 0
			);
		if (action && action.setDragging !== undefined)
			return new ResizeState(state.activeHandle, action.setDragging, state.dir);
		if (state.activeHandle > -1 && tr.docChanged) {
			let handle = tr.mapping.map(state.activeHandle, -1);
			if (!pointsAtCell(tr.doc.resolve(handle))) {
				handle = -1;
			}
			return new ResizeState(handle, state.dragging, state.dir);
		}
		return state;
	}
}

function handleMouseMove(
	view: EditorView,
	event: MouseEvent,
	handleWidth: number,
	cellMinWidth: number,
	lastColumnResizable: boolean
): void {
	const pluginState = columnResizingPluginKey.getState(view.state);
	if (!pluginState) return;
	let dir: Direction = 'vertical';
	if (!pluginState.dragging) {
		const target = domCellAround(event.target as HTMLElement);
		let cell = -1;
		if (target) {
			const { left, right, top, bottom } = target.getBoundingClientRect();
			if (event.clientX - left <= handleWidth) {
				dir = 'vertical';
				cell = edgeCell(view, event, 'left', handleWidth);
			} else if (right - event.clientX <= handleWidth) {
				dir = 'vertical';
				cell = edgeCell(view, event, 'right', handleWidth);
			} else if (event.clientY - top <= handleWidth) {
				dir = 'horizontal';
				cell = edgeCell(view, event, 'top', handleWidth);
			} else if (bottom - event.clientY <= handleWidth) {
				dir = 'horizontal';
				cell = edgeCell(view, event, 'bottom', handleWidth);
			}
		}

		if (cell != pluginState.activeHandle) {
			if (!lastColumnResizable && cell !== -1) {
				const $cell = view.state.doc.resolve(cell);
				const table = $cell.node(-1);
				const map = TableMap.get(table);
				const tableStart = $cell.start(-1);
				const col =
					map.colCount($cell.pos - tableStart) +
					$cell.nodeAfter!.attrs.colspan -
					1;

				if (col == map.width - 1) {
					return;
				}
			}

			updateHandle(view, cell, dir);
		}
	}
}

function handleMouseLeave(view: EditorView): void {
	const pluginState = columnResizingPluginKey.getState(view.state);
	if (pluginState && pluginState.activeHandle > -1 && !pluginState.dragging)
		updateHandle(view, -1);
}

function handleMouseDown(
	view: EditorView,
	event: MouseEvent,
	cellMinWidth: number
): boolean {
	const win = view.dom.ownerDocument.defaultView ?? window;

	const pluginState = columnResizingPluginKey.getState(view.state);
	if (!pluginState || pluginState.activeHandle == -1 || pluginState.dragging)
		return false;

	const cell = view.state.doc.nodeAt(pluginState.activeHandle)!;
	const width = currentColWidth(view, pluginState.activeHandle, cell.attrs);
	const height = currentRowHeight(view, pluginState.activeHandle);
	view.dispatch(
		view.state.tr.setMeta(columnResizingPluginKey, {
			setDragging: {
				startX: event.clientX,
				startWidth: width,
				startY: event.clientY,
				startHeight: height
			}
		})
	);

	function finish(event: MouseEvent) {
		win.removeEventListener('mouseup', finish);
		win.removeEventListener('mousemove', move);
		const pluginState = columnResizingPluginKey.getState(view.state);
		if (pluginState?.dragging) {
			updateColumnWidth(
				view,
				pluginState.activeHandle,
				draggedWidth(pluginState.dragging, event, cellMinWidth)
			);
			view.dispatch(
				view.state.tr.setMeta(columnResizingPluginKey, { setDragging: null })
			);
		}
	}

	function move(event: MouseEvent): void {
		if (!event.which) return finish(event);
		const pluginState = columnResizingPluginKey.getState(view.state);
		if (!pluginState) return;
		if (pluginState.dragging) {
			if (pluginState.dir === 'vertical') {
				const dragged = draggedWidth(pluginState.dragging, event, cellMinWidth);
				displayColumnWidth(
					view,
					pluginState.activeHandle,
					dragged,
					cellMinWidth
				);
			} else {
				const dragged = draggedHeight(pluginState.dragging, event);
				displayRowHeight(view, pluginState.activeHandle, dragged);
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

function domCellAround(target: HTMLElement | null): HTMLElement | null {
	while (target && target.nodeName != 'TD' && target.nodeName != 'TH')
		target =
			target.classList && target.classList.contains('ProseMirror')
				? null
				: (target.parentNode as HTMLElement);
	return target;
}

function edgeCell(
	view: EditorView,
	event: MouseEvent,
	side: 'left' | 'right' | 'top' | 'bottom',
	offset: number
): number {
	// posAtCoords returns inconsistent positions when cursor is moving
	// across a collapsed table border. Use an offset to adjust the
	// target viewport coordinates away from the table border.
	const offsetX = side == 'right' ? -offset : offset;
	const offsetY = side == 'bottom' ? -offset : offset;
	const found = view.posAtCoords({
		left: event.clientX + offsetX,
		top: event.clientY + offsetY
	});
	if (!found) return -1;
	const { pos } = found;
	const $cell = cellAround(view.state.doc.resolve(pos));
	if (!$cell) return -1;
	if (side == 'right' || side == 'bottom') return $cell.pos;
	const map = TableMap.get($cell.node(-1)),
		start = $cell.start(-1);
	const index = map.map.indexOf($cell.pos - start);
	const { width } = map;
	return side == 'left'
		? index % width == 0
			? -1
			: start + map.map[index - 1]
		: Math.floor(index / width) == 0
			? -1
			: start + map.map[index - width];
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

function updateHandle(
	view: EditorView,
	value: number,
	dir: Direction = 'vertical'
): void {
	view.dispatch(
		view.state.tr.setMeta(columnResizingPluginKey, { setHandle: value, dir })
	);
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
	// view.dispatch(view.state.tr.setNodeAttribute(tr - 1, 'height', height));
	const dom = view.nodeDOM(tr - 1) as HTMLElement;

	dom.style.height = height + 'px';
}

function zeroes(n: number): 0[] {
	return Array(n).fill(0);
}

export function handleDecorations(
	state: EditorState,
	cell: number,
	dir: Direction = 'vertical'
): DecorationSet {
	const decorations = [];
	const $cell = state.doc.resolve(cell);
	const table = $cell.node(-1);
	if (!table) {
		return DecorationSet.empty;
	}
	const map = TableMap.get(table);
	const start = $cell.start(-1);
	if (dir === 'vertical') {
		const col =
			map.colCount($cell.pos - start) + $cell.nodeAfter!.attrs.colspan;

		for (let row = 0; row < map.height; row++) {
			const index = col + row * map.width - 1;
			// For positions that have either a different cell or the end
			// of the table to their right, and either the top of the table or
			// a different cell above them, add a decoration
			if (
				(col == map.width || map.map[index] != map.map[index + 1]) &&
				(row == 0 || map.map[index] != map.map[index - map.width])
			) {
				const cellPos = map.map[index];
				const pos = start + cellPos + table.nodeAt(cellPos)!.nodeSize - 1;
				const dom = document.createElement('div');
				dom.className = 'column-resize-handle';
				decorations.push(Decoration.widget(pos, dom));
			}
		}
	} else {
		const index = map.map.indexOf($cell.pos - start);
		const row = Math.floor(index / map.width);
		for (let col = 0; col < map.width; col++) {
			const index = col + row * map.width;
			const cellPos = map.map[index];
			const pos = start + cellPos + table.nodeAt(cellPos)!.nodeSize - 1;
			const dom = document.createElement('div');
			dom.className = 'row-resize-handle';
			decorations.push(Decoration.widget(pos, dom));
		}
	}
	return DecorationSet.create(state.doc, decorations);
}
