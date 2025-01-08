import { EditorState } from 'prosemirror-state';
import { getTimelineNodeTypes } from './schema';

export function isInTimeline(state: EditorState) {
	const $head = state.selection.$head;
	const { timelineItem } = getTimelineNodeTypes(state.schema.nodes);
	for (let d = $head.depth; d > 0; d--) {
		if ($head.node(d).type === timelineItem) return true;
	}
	return false;
}
