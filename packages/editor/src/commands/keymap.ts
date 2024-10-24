import {
	splitBlock,
	chainCommands,
	newlineInCode,
	createParagraphNear,
	liftEmptyBlock,
	baseKeymap,
	deleteSelection,
	joinBackward,
	selectNodeBackward
} from 'prosemirror-commands';
import { Attrs, Fragment, Node, NodeType, Slice } from 'prosemirror-model';
import { canSplit } from 'prosemirror-transform';
import {
	Command,
	EditorState,
	NodeSelection,
	Selection,
	TextSelection
} from 'prosemirror-state';
import { schema } from '../model';
import { redo, undo } from 'prosemirror-history';
import { DecorationSet, EditorView } from 'prosemirror-view';
import { createTaskList } from '../components/taskList';
import { highlightCodePluginKey } from '../components/codeBlock/highlightCodePlugin';

const splitListItem = (itemTypes: NodeType[], itemAttrs?: Attrs): Command => {
	return (state, dispatch) => {
		let { $from, $to, node } = state.selection as NodeSelection;
		if ((node && node.isBlock) || $from.depth < 2 || !$from.sameParent($to))
			return false;
		let grandParent = $from.node(-1);
		if (!itemTypes.includes(grandParent.type)) return false;

		const liCount = $from.node(-2).childCount;
		if (
			$from.parent.content.size == 0 &&
			$from.node(-1).childCount == $from.indexAfter(-1)
		) {
			if (
				$from.depth == 3 ||
				!itemTypes.includes($from.node(-3).type) ||
				$from.index(-2) != liCount - 1
			)
				return false;
			if (dispatch) {
				let wrap = Fragment.empty;
				let depthBefore = $from.index(-1) ? 1 : $from.index(-2) ? 2 : 3;
				console.log(depthBefore, $from);

				// Build a fragment containing empty versions of the structure
				// from the outer list item to the parent node of the cursor
				for (let d = $from.depth - depthBefore; d >= $from.depth - 3; d--)
					wrap = Fragment.from($from.node(d).copy(wrap));
				console.log(wrap, $from.node(4), $from.node(3));

				let depthAfter =
					$from.indexAfter(-1) < $from.node(-2).childCount
						? 1
						: $from.indexAfter(-2) < $from.node(-3).childCount
							? 2
							: 3;
				// Add a second list item with an empty default start node
				wrap = wrap.append(Fragment.from(itemTypes[0].createAndFill()));

				let start = $from.before($from.depth - (depthBefore - 1));
				const s = new Slice(wrap, 4 - depthBefore, 0);
				let tr = state.tr.replace(start, $from.after(-depthAfter), s);
				let sel = -1;
				tr.doc.nodesBetween(start, tr.doc.content.size, (node, pos) => {
					if (sel > -1) return false;
					if (node.isTextblock && node.content.size == 0) sel = pos + 1;
				});
				if (sel > -1) tr.setSelection(Selection.near(tr.doc.resolve(sel)));
				dispatch(tr.scrollIntoView());
			}
			return true;
		}
		let nextType =
			$to.pos == $from.end() ? grandParent.contentMatchAt(0).defaultType : null;
		let tr = state.tr.delete($from.pos, $to.pos);
		let types = nextType
			? [
					itemAttrs ? { type: itemTypes[0], attrs: itemAttrs } : null,
					{ type: nextType }
				]
			: undefined;
		if (!canSplit(tr.doc, $from.pos, 2, types)) return false;
		if (dispatch) dispatch(tr.split($from.pos, 2, types).scrollIntoView());
		return true;
	};
};

function findNextVisiblePos(doc: Node, pos: number) {
	let currentPos = pos;
	while (currentPos < doc.content.size) {
		const node = doc.nodeAt(currentPos);
		if (!node) break;
		if (!node.attrs.hidden) return currentPos;
		currentPos += node.nodeSize;
	}
	return currentPos;
}

const headingEnter: Command = (state, dispatch) => {
	const { $from, $to } = state.selection;
	if (!$from.sameParent($to) || $from.parent.type !== schema.nodes.heading)
		return false;
	const pos = $from.after();
	const node = $from.parent;
	if (dispatch && node.attrs.fold) {
		const position = findNextVisiblePos(state.doc, pos);
		let tr = state.tr.insert(
			position,
			schema.nodes.heading.create({ level: node.attrs.level })
		);
		tr = tr.setSelection(TextSelection.create(tr.doc, position + 1));
		dispatch(tr);

		return true;
	}
	return false;
};

function isAtWidget(state: EditorState, decorations?: DecorationSet) {
	const { selection } = state;
	const { $from } = selection;
	const pos = $from.pos;

	const [widget] = decorations?.find(pos, pos) || [];
	// console.log(widget.inline);

	return widget && !(widget as any).inline;
}

export const myKeymap: { [key: string]: Command } = {
	...baseKeymap,
	Enter: chainCommands(
		headingEnter,
		splitListItem([schema.nodes.list_item, schema.nodes.taskItem]),
		newlineInCode,
		createParagraphNear,
		liftEmptyBlock,
		splitBlock
	),
	// Backspace: chainCommands(
	// 	deleteSelection,
	// 	(state, dispatch) => {
	// 		const { selection, doc } = state;
	// 		const decorations = highlightCodePluginKey.getState(state)?.decorations;
	// 		const { $from } = selection;
	// 		const { pos } = $from;

	// 		// 检查是否处在widget上（行号）
	// 		if (
	// 			$from.parent.type === schema.nodes.codeBlock &&
	// 			isAtWidget(state, decorations) &&
	// 			pos > $from.before() + 1
	// 		) {
	// 			const p = pos - 1;
	// 			dispatch?.(
	// 				state.tr
	// 					.setSelection(TextSelection.create(state.doc, p))
	// 					.delete(p, pos)
	// 			);
	// 		}

	// 		// 默认行为
	// 		return false;
	// 	},
	// 	joinBackward,
	// 	selectNodeBackward
	// ),
	'Mod-z': undo,
	'Mod-y': redo,
	Tab: (state: EditorState, dispatch?: EditorView['dispatch']) => {
		const { $from, $to } = state.selection;
		if (!$from.sameParent($to) || $from.parent.type !== schema.nodes.codeBlock)
			return false;
		if (dispatch) {
			dispatch(state.tr.insertText('\t'));
			return true;
		}
		return false;
	},
	'Ctrl-Shift-L': createTaskList
};
