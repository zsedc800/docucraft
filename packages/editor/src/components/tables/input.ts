import { EditorView } from 'prosemirror-view';
import { cellAround, inSameTable, isEmpty, tableEditingKey } from './utils';
import { CellSelection } from './cellSelection';
import { ResolvedPos } from 'prosemirror-model';

export function handleMouseDown(
	view: EditorView,
	startEvent: MouseEvent
): void {
	if (startEvent.ctrlKey || startEvent.metaKey) return;

	const startDOMCell = domInCell(view, startEvent.target as Node);
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
		// Adding to a selection that starts in another cell (causing a
		// cell selection to be created).
		setCellSelection($anchor, startEvent);
		startEvent.preventDefault();
	} else if (!startDOMCell) {
		// Not in a cell, let the default behavior happen.
		return;
	}

	// Create and dispatch a cell selection between the given anchor and
	// the position under the mouse.
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

	// Stop listening to mouse motion events.
	function stop(): void {
		view.root.removeEventListener('mouseup', stop);
		view.root.removeEventListener('dragstart', stop);
		view.root.removeEventListener('mousemove', move);
		if (!isEmpty(tableEditingKey.getState(view.state)?.set))
			view.dispatch(view.state.tr.setMeta(tableEditingKey, { set: -1 }));
	}

	const { clientX: x1, clientY: y1 } = startEvent;

	function move(_event: Event): void {
		const event = _event as MouseEvent;
		const { clientX: x2, clientY: y2 } = event;
		if (Math.abs(x1 - x2) < 4 && Math.abs(y1 - y2) < 4) return;
		console.log('move');

		const anchor = tableEditingKey.getState(view.state)?.set;
		let $anchor;
		if (anchor || anchor == 0) {
			// Continuing an existing cross-cell selection
			$anchor = view.state.doc.resolve(anchor);
		} else if (domInCell(view, event.target as Node) != startDOMCell) {
			// Moving out of the initial cell -- start a new cell selection
			$anchor = cellUnderMouse(view, startEvent);
			if (!$anchor) return stop();
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

export const handleKeyDown = () => {};
export const handlePaste = () => {};
