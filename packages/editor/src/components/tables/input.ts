import { EditorView } from 'prosemirror-view';
import {
	cellAround,
	inSameTable,
	isEmpty,
	isInTable,
	nextCell,
	selectionCell,
	tableEditingKey
} from './utils';
import { CellSelection } from './cellSelection';
import { Fragment, ResolvedPos, Slice } from 'prosemirror-model';
import { keydownHandler } from 'prosemirror-keymap';
import {
	Command,
	EditorState,
	Selection,
	TextSelection
} from 'prosemirror-state';
import { tableNodeTypes } from './schema';
import { clipCells, fitSlice, insertCells, pastedCells } from './copypaste';
import { TableMap } from './tableMap';

type Axis = 'horiz' | 'vert';

export type Direction = -1 | 1;

const deleteCellSelection: Command = (state, dispatch) => {
	const sel = state.selection;
	if (!(sel instanceof CellSelection)) return false;
	if (dispatch) {
		const tr = state.tr;
		const baseContent = tableNodeTypes(state.schema).cell.createAndFill()!
			.content;
		sel.forEachCell((cell, pos) => {
			if (!cell.content.eq(baseContent))
				tr.replace(
					tr.mapping.map(pos + 1),
					tr.mapping.map(pos + cell.nodeSize - 1),
					new Slice(baseContent, 0, 0)
				);
		});
		if (tr.docChanged) dispatch(tr);
	}
	return true;
};

export const handleKeyDown = keydownHandler({
	ArrowLeft: arrow('horiz', -1),
	ArrowRight: arrow('horiz', 1),
	ArrowUp: arrow('vert', -1),
	ArrowDown: arrow('vert', 1),
	'Shift-ArrowLeft': shiftArrow('horiz', -1),
	'Shift-ArrowRight': shiftArrow('horiz', 1),
	'Shift-ArrowUp': shiftArrow('vert', -1),
	'Shift-ArrowDown': shiftArrow('vert', 1),
	Backspace: deleteCellSelection,
	'Mod-Backspace': deleteCellSelection,
	Delete: deleteCellSelection,
	'Mod-Delete': deleteCellSelection
});

function maybeSetSelection(
	state: EditorState,
	dispatch: undefined | EditorView['dispatch'],
	selection: Selection
): boolean {
	if (selection.eq(state.selection)) return false;
	if (dispatch) dispatch(state.tr.setSelection(selection).scrollIntoView());
	return true;
}

export function arrow(axis: Axis, dir: Direction): Command {
	return (state, dispatch, view) => {
		if (!view) return false;
		const sel = state.selection;
		if (sel instanceof CellSelection) {
			return maybeSetSelection(
				state,
				dispatch,
				Selection.near(sel.$headCell, dir)
			);
		}
		if (axis != 'horiz' && !sel.empty) return false;
		const end = atEndOfCell(view, axis, dir);
		if (end == null) return false;
		if (axis == 'horiz') {
			return maybeSetSelection(
				state,
				dispatch,
				Selection.near(state.doc.resolve(sel.head + dir), dir)
			);
		} else {
			const $cell = state.doc.resolve(end);
			const $next = nextCell($cell, axis, dir);
			let newSel;
			if ($next) newSel = Selection.near($next, 1);
			else if (dir < 0)
				newSel = Selection.near(state.doc.resolve($cell.before(-1)), -1);
			else newSel = Selection.near(state.doc.resolve($cell.after(-1)), 1);
			return maybeSetSelection(state, dispatch, newSel);
		}
	};
}

function shiftArrow(axis: Axis, dir: Direction): Command {
	return (state, dispatch, view) => {
		if (!view) return false;
		let cellSel: CellSelection;
		const sel = state.selection;
		if (sel instanceof CellSelection) {
			cellSel = sel;
		} else {
			const end = atEndOfCell(view, axis, dir);
			if (end == null) return false;
			cellSel = new CellSelection(state.doc.resolve(end));
		}
		const $head = nextCell(cellSel.$headCell, axis, dir);
		if (!$head) return false;
		return maybeSetSelection(
			state,
			dispatch,
			new CellSelection(cellSel.$anchorCell, $head)
		);
	};
}

export const handlePaste = (
	view: EditorView,
	e: ClipboardEvent,
	slice: Slice
): boolean => {
	if (!isInTable(view.state)) return false;
	let cells = pastedCells(slice);
	const sel = view.state.selection;
	if (sel instanceof CellSelection) {
		if (!cells)
			cells = {
				width: 1,
				height: 1,
				rows: [
					Fragment.from(fitSlice(tableNodeTypes(view.state.schema).cell, slice))
				]
			};
		const table = sel.$anchorCell.node(-1);
		const start = sel.$anchorCell.start(-1);
		const rect = TableMap.get(table).rectBetween(
			sel.$anchorCell.pos - start,
			sel.$headCell.pos - start
		);
		cells = clipCells(cells, rect.right - rect.left, rect.bottom - rect.top);
		insertCells(view.state, view.dispatch, start, rect, cells);
		return true;
	} else if (cells) {
		const $cell = selectionCell(view.state);
		const start = $cell.start(-1);
		insertCells(
			view.state,
			view.dispatch,
			start,
			TableMap.get($cell.node(-1)).findCell($cell.pos - start),
			cells
		);

		return true;
	} else {
		return false;
	}
};

export function handleMouseDown(
	view: EditorView,
	startEvent: MouseEvent
): void {
	if (startEvent.ctrlKey || startEvent.metaKey) return;

	const startDOMCell = domInCell(view, startEvent.target as Node);
	const $cell = cellUnderMouse(view, startEvent);
	if (startDOMCell) {
		startEvent.preventDefault();
	}
	let $anchor;
	if (startEvent.shiftKey && view.state.selection instanceof CellSelection) {
		// Adding to an existing cell selection
		setCellSelection(view.state.selection.$anchorCell, startEvent);
		startEvent.preventDefault();
	} else if (
		startEvent.shiftKey &&
		startDOMCell &&
		($anchor = cellAround(view.state.selection.$anchor)) != null &&
		cellUnderMouse(view, startEvent)?.pos != $anchor.pos
	) {
		setCellSelection($anchor, startEvent);
		startEvent.preventDefault();
	} else if (!startDOMCell) {
		return;
	}

	function setCellSelection($anchor: ResolvedPos, event: MouseEvent): void {
		let $head = cellUnderMouse(view, event);
		const starting = tableEditingKey.getState(view.state)?.set == null;
		if (!$head || !inSameTable($anchor, $head)) {
			if (starting) $head = $anchor;
			else return;
		}
		const selection = new CellSelection($anchor, $head);
		if (starting || !view.state.selection.eq(selection)) {
			const tr = view.state.tr.setSelection(selection);

			if (starting) tr.setMeta(tableEditingKey, { set: $anchor.pos });
			view.dispatch(tr);
		}
	}
	const { clientX: x1, clientY: y1 } = startEvent;
	function stop(e?: Event): void {
		if (e?.type == 'mouseup') {
			const _event: MouseEvent = e as MouseEvent;
			const { clientX: x2, clientY: y2 } = _event;
			if (Math.abs(x1 - x2) < 4 && Math.abs(y1 - y2) < 4) {
				const pos = view.posAtCoords({
					left: x2,
					top: y2
				});
				if (pos) {
					const newSelection = TextSelection.create(
						view.state.doc,
						pos.pos,
						pos.pos
					);
					const tr = view.state.tr.setSelection(newSelection);
					view.dispatch(tr);
					view.focus();
				}
			} else {
				const tableDOM = view.nodeDOM($cell!.start(-2));
				(tableDOM?.firstChild as HTMLDivElement)?.focus();

				// document.querySelector<HTMLElement>('.hiddenfocus')?.focus();
			}
		}

		view.root.removeEventListener('mouseup', stop);
		view.root.removeEventListener('dragstart', stop);
		view.root.removeEventListener('mousemove', move);
		if (!isEmpty(tableEditingKey.getState(view.state)?.set))
			view.dispatch(view.state.tr.setMeta(tableEditingKey, { set: -1 }));
	}

	let startPos = view.posAtCoords({ left: x1, top: y1 });

	function move(_event: Event): void {
		const event = _event as MouseEvent;

		const anchor = tableEditingKey.getState(view.state)?.set;
		let $anchor;
		if (anchor || anchor == 0) {
			$anchor = view.state.doc.resolve(anchor);
		} else if (domInCell(view, event.target as Node) != startDOMCell) {
			$anchor = cellUnderMouse(view, startEvent);
			if (!$anchor) return stop();
			view.dom.blur();
		} else {
			const head = view.posAtCoords({
				left: event.clientX,
				top: event.clientY
			});
			view.dispatch(
				view.state.tr.setSelection(
					TextSelection.create(view.state.doc, startPos!.pos, head!.pos)
				)
			);
		}
		if ($anchor) setCellSelection($anchor, event);
	}

	view.root.addEventListener('mouseup', stop);
	view.root.addEventListener('dragstart', stop);
	view.root.addEventListener('mousemove', move);
}

export function domInCell(view: EditorView, dom: Node | null): Node | null {
	for (; dom && dom != view.dom; dom = dom.parentNode) {
		if (dom.nodeName == 'TD' || dom.nodeName == 'TH') {
			return dom;
		}
	}
	return null;
}

function cellUnderMouse(
	view: EditorView,
	event: MouseEvent
): ResolvedPos | null {
	const mousePos = view.posAtCoords({
		left: event.clientX,
		top: event.clientY
	});
	if (!mousePos) return null;
	return mousePos ? cellAround(view.state.doc.resolve(mousePos.pos)) : null;
}

function atEndOfCell(view: EditorView, axis: Axis, dir: number): null | number {
	if (!(view.state.selection instanceof TextSelection)) return null;
	const { $head } = view.state.selection;
	for (let d = $head.depth - 1; d >= 0; d--) {
		const parent = $head.node(d),
			index = dir < 0 ? $head.index(d) : $head.indexAfter(d);

		if (index != (dir < 0 ? 0 : parent.childCount)) return null;

		if (
			parent.type.spec.tableRole == 'cell' ||
			parent.type.spec.tableRole == 'headerCell'
		) {
			const cellPos = $head.before(d);
			const dirStr: 'up' | 'down' | 'left' | 'right' =
				axis == 'vert' ? (dir > 0 ? 'down' : 'up') : dir > 0 ? 'right' : 'left';
			return view.endOfTextblock(dirStr) ? cellPos : null;
		}
	}
	return null;
}

export const handleTripleClick = (view: EditorView, pos: number): boolean => {
	const doc = view.state.doc,
		$cell = cellAround(doc.resolve(pos));
	if (!$cell) return false;
	view.dispatch(
		view.state.tr
			.setSelection(new CellSelection($cell))
			.setMeta(tableEditingKey, { set: $cell.pos })
	);
	return true;
};
