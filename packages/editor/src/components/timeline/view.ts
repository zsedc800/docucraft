import { ViewMutationRecord } from 'prosemirror-view';
import { BaseNodeView } from '../../utils/view';
import {
	RCTimeline,
	RCTimelineContent,
	RCTimelineItem,
	RCTimelineOpposite,
	RCTimelineSeparator
} from './Timeline';
import { TimelineKeys } from './schema';
import { TextSelection } from 'prosemirror-state';
import { NodeViewConstructor, NodeViewParameters } from '../../interface';

export class TimelineNodeView extends BaseNodeView {
	constructor(...[node, view, getPos]: NodeViewParameters) {
		super(node, view, getPos);
		this.component = RCTimeline;
		this.render();
		this.contentDOM = this.dom;
	}
}

export class TimelineItemView extends BaseNodeView {
	constructor(...[node, view, getPos]: NodeViewParameters) {
		super(node, view, getPos);
		this.component = RCTimelineItem;
		this.render();
		this.contentDOM = this.dom;
	}
}

export class TimelineOppositeView extends BaseNodeView {
	constructor(...[node, view, getPos]: NodeViewParameters) {
		super(node, view, getPos);
		this.component = RCTimelineOpposite;
		this.render();
		this.contentDOM = this.dom;
	}
}

export class TimelineSeparatorView extends BaseNodeView {
	constructor(...[node, view, getPos]: NodeViewParameters) {
		super(node, view, getPos);
		this.component = RCTimelineSeparator;
		this.render();
	}
	onFocusIn(): void {
		const { view, getPos } = this;
		const pos = getPos();
		if (!pos) return;
		const { state, dispatch } = view;

		dispatch(state.tr.setSelection(TextSelection.create(state.doc, pos + 1)));
	}
}
export class TimelineContentView extends BaseNodeView {
	constructor(...[node, view, getPos]: NodeViewParameters) {
		super(node, view, getPos);
		this.component = RCTimelineContent;
		this.render();
		this.contentDOM = this.dom;
	}
}

export function createTimelineViews(): Record<
	TimelineKeys,
	NodeViewConstructor
> {
	return {
		timeline: (...args) => new TimelineNodeView(...args),
		timelineItem: (...args) => new TimelineItemView(...args),
		timelineOpposite: (...args) => new TimelineOppositeView(...args),
		timelineContent: (...args) => new TimelineContentView(...args),
		timelineSeparator: (...args) => new TimelineSeparatorView(...args)
	};
}
