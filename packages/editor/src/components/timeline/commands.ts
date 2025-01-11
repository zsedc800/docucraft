import {
	AllSelection,
	Command,
	NodeSelection,
	TextSelection
} from 'prosemirror-state';
import { createNode, createNodeAndFill } from '../../commands';
import { getTimelineNodeTypes } from './schema';
import { Attrs, ContentMatch, NodeType } from 'prosemirror-model';
import { isInTimeline } from './utils';

export function insertTimeline(): Command {
	return (state, dispatch) => {
		const {
			timeline,
			timelineContent,
			timelineOpposite,
			timelineItem,
			timelineSeparator
		} = getTimelineNodeTypes(state.schema.nodes);

		const node = createNode(
			timeline,
			{},
			createNode(timelineItem, {}, [
				// createNode(timelineOpposite),
				createNode(timelineSeparator),
				createNodeAndFill(timelineContent)!
			])
		);
		if (dispatch) {
			dispatch(state.tr.replaceSelectionWith(node));
		}
		return false;
	};
}

function defaultBlockAt(match: ContentMatch) {
	for (let i = 0; i < match.edgeCount; i++) {
		let { type } = match.edge(i);
		if (type.isTextblock && !type.hasRequiredAttrs()) return type;
	}
	return null;
}

export const splitTimeline: Command = (state, dispatch) => {
	let { $from, $to } = state.selection;

	if (!$from.depth || !isInTimeline(state)) return false;
	const { timelineOpposite, timelineContent } = getTimelineNodeTypes(
		state.schema.nodes
	);
	let types: (null | { type: NodeType; attrs?: Attrs | null })[] = [];
	let splitDepth,
		deflt,
		atEnd = false,
		atStart = false;
	for (let d = $from.depth; d > 0; d--) {
		let node = $from.node(d);
		if (node.type === timelineOpposite) {
			return true;
		} else if (node.type === timelineContent) {
		}
		// if (node.isBlock) {
		// 	atEnd = $from.end(d) == $from.pos + ($from.depth - d);
		// 	atStart = $from.start(d) == $from.pos - ($from.depth - d);
		// 	deflt = defaultBlockAt(
		// 		$from.node(d - 1).contentMatchAt($from.indexAfter(d - 1))
		// 	);
		// 	// let splitType = splitNode && splitNode($to.parent, atEnd, $from);
		// 	types.unshift(atEnd && deflt ? { type: deflt } : null);
		// 	splitDepth = d;
		// 	break;
		// } else {
		// 	if (d == 1) return false;
		// 	types.unshift(null);
		// }
	}

	// let tr = state.tr;
	// if (
	// 	state.selection instanceof TextSelection ||
	// 	state.selection instanceof AllSelection
	// )
	// 	tr.deleteSelection();
	// let splitPos = tr.mapping.map($from.pos);

	// if (!atEnd && atStart && $from.node(splitDepth).type != deflt) {
	// 	let first = tr.mapping.map($from.before(splitDepth)),
	// 		$first = tr.doc.resolve(first);
	// 	if (
	// 		deflt &&
	// 		$from
	// 			.node(splitDepth - 1)
	// 			.canReplaceWith($first.index(), $first.index() + 1, deflt)
	// 	)
	// 		tr.setNodeMarkup(tr.mapping.map($from.before(splitDepth)), deflt);
	// }
	// if (dispatch) dispatch(tr.scrollIntoView());
	return false;
};
