import { Node, ResolvedPos } from 'prosemirror-model';
import { EditorState, TextSelection, Transaction } from 'prosemirror-state';
import { canJoin } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';

export function atBlockStart(
	state: EditorState,
	view?: EditorView
): ResolvedPos | null {
	let { $cursor } = state.selection as TextSelection;
	if (
		!$cursor ||
		(view ? !view.endOfTextblock('backward', state) : $cursor.parentOffset > 0)
	)
		return null;
	return $cursor;
}

export function textblockAt(node: Node, side: 'start' | 'end', only = false) {
	for (
		let scan: Node | null = node;
		scan;
		scan = side == 'start' ? scan.firstChild : scan.lastChild
	) {
		if (scan.isTextblock) return true;
		if (only && scan.childCount != 1) return false;
	}
	return false;
}

export function findCutBefore($pos: ResolvedPos): ResolvedPos | null {
	if (!$pos.parent.type.spec.isolating)
		for (let i = $pos.depth - 1; i >= 0; i--) {
			if ($pos.index(i) > 0) return $pos.doc.resolve($pos.before(i + 1));
			if ($pos.node(i).type.spec.isolating) break;
		}
	return null;
}

export function joinMaybeClear(
	state: EditorState,
	$pos: ResolvedPos,
	dispatch: ((tr: Transaction) => void) | undefined
) {
	let before = $pos.nodeBefore,
		after = $pos.nodeAfter,
		index = $pos.index();
	if (!before || !after || !before.type.compatibleContent(after.type))
		return false;
	if (!before.content.size && $pos.parent.canReplace(index - 1, index)) {
		if (dispatch)
			dispatch(
				state.tr.delete($pos.pos - before.nodeSize, $pos.pos).scrollIntoView()
			);
		return true;
	}
	if (
		!$pos.parent.canReplace(index, index + 1) ||
		!(after.isTextblock || canJoin(state.doc, $pos.pos))
	)
		return false;
	if (dispatch) dispatch(state.tr.join($pos.pos).scrollIntoView());
	return true;
}
