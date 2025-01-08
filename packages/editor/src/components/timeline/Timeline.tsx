import { useNodeView } from '../../utils/view';
import {
	TimelineContentView,
	TimelineItemView,
	TimelineNodeView,
	TimelineOppositeView,
	TimelineSeparatorView
} from './view';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import SvgHome from '@docucraft/icons/svg/Home';
import { useEffect } from '@docucraft/srender';

export function RCTimeline({
	nodeView,
	position
}: {
	nodeView: TimelineNodeView;
	position: 'left' | 'right' | 'alternate';
}) {
	const { $dom } = useNodeView<HTMLUListElement>(nodeView);
	return (
		<Timeline
			data-pos={position}
			position={position}
			className="timeline"
			ref={$dom}
		/>
	);
}

export function RCTimelineItem({ nodeView }: { nodeView: TimelineItemView }) {
	const { $dom } = useNodeView(nodeView);
	return <TimelineItem className="timeline-item" ref={$dom} />;
}

export function RCTimelineOpposite({
	nodeView
}: {
	nodeView: TimelineOppositeView;
}) {
	const { $dom } = useNodeView(nodeView);
	useEffect(() => {
		if (!$dom.current) return;
		const timelineItem = $dom.current?.parentNode;
		if (!timelineItem) return;
		const timelineItemDot = timelineItem.querySelector('.timeline-item-dot');
		if (!timelineItemDot) return;
		const { height, paddingTop, paddingBottom, marginTop, marginBottom } =
			getComputedStyle(timelineItemDot);
		const h =
			parseInt(height) +
			parseInt(paddingTop) +
			parseInt(paddingBottom) +
			parseInt(marginTop) +
			parseInt(marginBottom);

		const top = Math.round(h / 2 - 8);
		$dom.current!.style.marginTop = top + 'px';
	}, []);
	return (
		<TimelineOppositeContent
			color="text.secondary"
			className="timeline-item-opposite"
			ref={$dom}
		/>
	);
}

export function RCTimelineSeparator({
	nodeView
}: {
	nodeView: TimelineSeparatorView;
}) {
	const { $dom } = useNodeView(nodeView);
	return (
		<TimelineSeparator ref={$dom}>
			<TimelineDot className="timeline-item-dot">
				<SvgHome />
			</TimelineDot>
			<TimelineConnector />
		</TimelineSeparator>
	);
}

export function RCTimelineContent({
	nodeView
}: {
	nodeView: TimelineContentView;
}) {
	const { $dom } = useNodeView(nodeView);
	return <TimelineContent className="timeline-item-content" ref={$dom} />;
}
