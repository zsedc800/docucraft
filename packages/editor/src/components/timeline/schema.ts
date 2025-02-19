import { NodeSpec } from 'prosemirror-model';
import { getNodeTypesByKeys } from '../../utils/basic';
import { createNodeSpec } from '../../utils/basic';
const keys = [
	'timeline',
	'timelineItem',
	'timelineContent',
	'timelineOpposite',
	'timelineSeparator'
] as const;

export type TimelineKeys = (typeof keys)[number];

export function createTimelineNodes(): Record<TimelineKeys, NodeSpec> {
	return {
		timeline: createNodeSpec({
			attrs: {
				position: { default: 'alternate' }
			},
			content: 'timelineItem+',
			group: 'block',
			parseDOM: [{ tag: 'ul.timeline' }],
			toDOM(node) {
				return ['ul', { class: 'timeline' }, 0];
			}
		}),
		timelineItem: createNodeSpec({
			attrs: {},
			content: '(timelineOpposite|timelineSeparator|timelineContent)+',
			group: 'block',
			parseDOM: [{ tag: 'li.timeline-item' }],
			toDOM(node) {
				return ['li', { class: 'timeline-item' }, 0];
			}
		}),
		timelineOpposite: createNodeSpec({
			group: 'block',
			content: 'inline*',
			isolating: true,
			parseDOM: [{ tag: 'div.timeline-opposite' }],
			toDOM() {
				return ['div', { class: 'timeline-opposite' }, 0];
			}
		}),
		timelineContent: createNodeSpec({
			group: 'block',
			content: 'block+',
			isolating: true,
			parseDOM: [{ tag: 'div.timeline-content' }],
			toDOM() {
				return ['div', { class: 'timeline-content' }, 0];
			}
		}),
		timelineSeparator: createNodeSpec({
			group: 'block',
			parseDOM: [{ tag: 'div.timeline-separator' }],
			toDOM() {
				return ['div', { class: 'timeline-separator' }];
			}
		})
	};
}

export const getTimelineNodeTypes = getNodeTypesByKeys(keys);
