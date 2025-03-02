import { Fragment, ResolvedPos, Slice } from 'prosemirror-model';
import {
	Command,
	EditorState,
	NodeSelection,
	Selection,
	TextSelection,
	Transaction
} from 'prosemirror-state';
import {
	ReplaceAroundStep,
	ReplaceStep,
	canJoin,
	liftTarget,
	replaceStep
} from 'prosemirror-transform';

import {
	atBlockStart,
	findCutBefore,
	joinMaybeClear,
	textblockAt
} from '../utils/commands';

function deleteBarrier(
	state: EditorState,
	$cut: ResolvedPos,
	dispatch: ((tr: Transaction) => void) | undefined,
	dir: number
) {
	let before = $cut.nodeBefore!,
		after = $cut.nodeAfter!,
		conn,
		match;
	let isolated = before.type.spec.isolating || after.type.spec.isolating;
	if (!isolated && joinMaybeClear(state, $cut, dispatch)) return true;

	let canDelAfter =
		!isolated && $cut.parent.canReplace($cut.index(), $cut.index() + 1);
	if (
		canDelAfter &&
		(conn = (match = before.contentMatchAt(before.childCount)).findWrapping(
			after.type
		)) &&
		match.matchType(conn[0] || after.type)!.validEnd
	) {
		if (dispatch) {
			let end = $cut.pos + after.nodeSize,
				wrap = Fragment.empty;
			for (let i = conn.length - 1; i >= 0; i--)
				wrap = Fragment.from(conn[i].create(null, wrap));
			wrap = Fragment.from(before.copy(wrap));
			let tr = state.tr.step(
				new ReplaceAroundStep(
					$cut.pos - 1,
					end,
					$cut.pos,
					end,
					new Slice(wrap, 1, 0),
					conn.length,
					true
				)
			);
			let $joinAt = tr.doc.resolve(end + 2 * conn.length);
			if (
				$joinAt.nodeAfter &&
				$joinAt.nodeAfter.type == before.type &&
				canJoin(tr.doc, $joinAt.pos)
			)
				tr.join($joinAt.pos);
			dispatch(tr.scrollIntoView());
		}
		return true;
	}

	let selAfter =
		after.type.spec.isolating || (dir > 0 && isolated)
			? null
			: Selection.findFrom($cut, 1);
	let range = selAfter && selAfter.$from.blockRange(selAfter.$to),
		target = range && liftTarget(range);
	if (target != null && target >= $cut.depth) {
		if (dispatch) dispatch(state.tr.lift(range!, target).scrollIntoView());
		return true;
	}

	if (
		canDelAfter &&
		textblockAt(after, 'start', true) &&
		textblockAt(before, 'end')
	) {
		let at = before,
			wrap = [];
		for (;;) {
			wrap.push(at);
			if (at.isTextblock) break;
			at = at.lastChild!;
		}
		let afterText = after,
			afterDepth = 1;
		for (; !afterText.isTextblock; afterText = afterText.firstChild!)
			afterDepth++;
		if (at.canReplace(at.childCount, at.childCount, afterText.content)) {
			if (dispatch) {
				let end = Fragment.empty;
				for (let i = wrap.length - 1; i >= 0; i--)
					end = Fragment.from(wrap[i].copy(end));
				let tr = state.tr.step(
					new ReplaceAroundStep(
						$cut.pos - wrap.length,
						$cut.pos + after.nodeSize,
						$cut.pos + afterDepth,
						$cut.pos + after.nodeSize - afterDepth,
						new Slice(end, wrap.length, 0),
						0,
						true
					)
				);
				dispatch(tr.scrollIntoView());
			}
			return true;
		}
	}

	return false;
}

export const joinBackward: Command = (state, dispatch, view) => {
	let $cursor = atBlockStart(state, view);
	if (!$cursor) return false;

	let $cut = findCutBefore($cursor);

	// If there is no node before this, try to lift
	if (!$cut) {
		let range = $cursor.blockRange(),
			target = range && liftTarget(range);
		if (target == null) return false;
		if (dispatch) dispatch(state.tr.lift(range!, target).scrollIntoView());
		return true;
	}

	let before = $cut.nodeBefore!;
	if (before.type.name === 'timeline') {
		if (dispatch) {
			const after = $cut.nodeAfter!;
			const tr = state.tr.delete($cut.pos, $cut.pos + after.nodeSize);
			dispatch(tr.setSelection(TextSelection.create(tr.doc, $cut.pos - 4)));
		}
		return true;
	}

	// Apply the joining algorithm
	if (deleteBarrier(state, $cut, dispatch, -1)) return true;

	// If the node below has no content and the node above is
	// selectable, delete the node below and select the one above.
	if (
		$cursor.parent.content.size == 0 &&
		(textblockAt(before, 'end') || NodeSelection.isSelectable(before))
	) {
		for (let depth = $cursor.depth; ; depth--) {
			let delStep = replaceStep(
				state.doc,
				$cursor.before(depth),
				$cursor.after(depth),
				Slice.empty
			);
			if (
				delStep &&
				(delStep as ReplaceStep).slice.size <
					(delStep as ReplaceStep).to - (delStep as ReplaceStep).from
			) {
				if (dispatch) {
					let tr = state.tr.step(delStep);
					tr.setSelection(
						textblockAt(before, 'end')
							? Selection.findFrom(
									tr.doc.resolve(tr.mapping.map($cut.pos, -1)),
									-1
								)!
							: NodeSelection.create(tr.doc, $cut.pos - before.nodeSize)
					);
					dispatch(tr.scrollIntoView());
				}
				return true;
			}
			if (depth == 1 || $cursor.node(depth - 1).childCount > 1) break;
		}
	}

	// If the node before is an atom, delete it
	if (before.isAtom && $cut.depth == $cursor.depth - 1) {
		if (dispatch)
			dispatch(
				state.tr.delete($cut.pos - before.nodeSize, $cut.pos).scrollIntoView()
			);
		return true;
	}

	return false;
};
