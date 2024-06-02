import { EditorView } from 'prosemirror-view';
import { cellAround, inSameTable, tableEditingKey } from './utils';
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
    const starting = tableEditingKey.getState(view.state) == null;
    if (!$head || !inSameTable($anchor, $head)) {
      if (starting) $head = $anchor;
      else return;
    }
    const selection = new CellSelection($anchor, $head);
    if (starting || !view.state.selection.eq(selection)) {
      const tr = view.state.tr.setSelection(selection);
      if (starting) tr.setMeta(tableEditingKey, $anchor.pos);
      view.dispatch(tr);
    }
  }

  // Stop listening to mouse motion events.
  function stop(): void {
    view.root.removeEventListener('mouseup', stop);
    view.root.removeEventListener('dragstart', stop);
    view.root.removeEventListener('mousemove', move);
    if (tableEditingKey.getState(view.state)?.set != null)
      view.dispatch(view.state.tr.setMeta(tableEditingKey, { set: -1 }));
  }

  function move(_event: Event): void {
    const event = _event as MouseEvent;
    const anchor = tableEditingKey.getState(view.state)?.set;
    let $anchor;
    if (anchor != null) {
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

function domInCell(view: EditorView, dom: Node | null): Node | null {
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
    top: event.clientY,
  });
  if (!mousePos) return null;
  return mousePos ? cellAround(view.state.doc.resolve(mousePos.pos)) : null;
}
