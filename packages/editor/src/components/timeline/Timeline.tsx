import { TextSelection } from 'prosemirror-state';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import SvgHome from '@docucraft/icons/svg/Home';
import { useEffect } from '@docucraft/srender';
import { createNode, createNodeAndFill } from '../../commands';
import { getTimelineNodeTypes } from './schema';
import Menu from '../../kits/Menu';
import { useNodeView } from '../../utils/view';
import { preventDispatch } from '../../utils/hooks';
import Tools from '../toolBar/Tools';
import { Align, AlignButton } from '../../kits/Button';
import {
	TimelineContentView,
	TimelineItemView,
	TimelineNodeView,
	TimelineOppositeView,
	TimelineSeparatorView
} from './view';

const getMappedVal = (pos: Align | 'alternate') =>
	pos === 'alternate' ? 'center' : pos;

export function RCTimeline({
	nodeView,
	position
}: {
	nodeView: TimelineNodeView;
	position: 'left' | 'right' | 'alternate';
}) {
	const { $dom } = useNodeView<HTMLUListElement>(nodeView);

	return (
		<Tools
			toolsAfter={
				<AlignButton
					style={{ fontSize: 16 }}
					command={false}
					align={getMappedVal(position)}
					filter={(item) => item.align !== 'justify'}
					onChange={(align) =>
						nodeView.setNodeAttribute(
							'position',
							align === 'center' ? 'alternate' : align
						)
					}
				/>
			}
		>
			<Timeline
				style={{ padding: 0 }}
				data-pos={position}
				position={position}
				className="timeline"
				ref={$dom}
			/>
		</Tools>
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
	const { view, getPos, getResolvedPos } = nodeView;
	const $pos = getResolvedPos();

	return (
		<TimelineSeparator ref={$dom}>
			<Menu
				slotProps={{ paper: { elevation: 1 } }}
				content={({ close }) => {
					const handler = (fn: () => void) => {
						return () => {
							fn();
							view.focus();
							close();
						};
					};
					return (
						<MenuList
							className="menu-list"
							style={{ marginTop: 20, width: 180 }}
						>
							<MenuItem
								onClick={handler(() => {
									const $pos = getResolvedPos();
									if ($pos) {
										const {
											state: { tr, schema },
											dispatch
										} = view;
										const node = $pos.parent;

										const { timelineItem, timelineContent, timelineSeparator } =
											getTimelineNodeTypes(schema.nodes);
										tr.insert(
											$pos.before() + node.nodeSize,
											createNode(timelineItem, {}, [
												createNode(timelineSeparator),
												createNodeAndFill(timelineContent)!
											])
										);
										dispatch(tr);
									}
								})}
							>
								<ListItemIcon className="menu-list-icon" />
								<ListItemText>向下添加项目</ListItemText>
							</MenuItem>
							<>
								{$pos && $pos.index() > 0 ? (
									<MenuItem
										onClick={handler(() => {
											const $pos = getResolvedPos();
											if ($pos) {
												const node = $pos.nodeBefore;
												const pos = $pos.start();
												if (node) {
													view.dispatch(
														view.state.tr.delete(pos, pos + node.nodeSize)
													);
												}
											}
										})}
									>
										<ListItemIcon className="menu-list-icon" />
										<ListItemText>删除标签</ListItemText>
									</MenuItem>
								) : (
									<MenuItem
										onClick={handler(() => {
											const pos = getPos();
											if (pos || pos === 0) {
												const {
													state: { tr, schema },
													dispatch
												} = view;

												tr.insert(
													pos,
													createNode(
														getTimelineNodeTypes(schema.nodes).timelineOpposite
													)
												);
												tr.setSelection(TextSelection.create(tr.doc, pos + 1));
												dispatch(tr);
											}
										})}
									>
										<ListItemIcon className="menu-list-icon" />
										<ListItemText>添加标签</ListItemText>
									</MenuItem>
								)}
							</>
						</MenuList>
					);
				}}
			>
				<TimelineDot
					className="timeline-item-dot"
					onMouseUp={() => {
						preventDispatch();
					}}
				>
					<SvgHome />
				</TimelineDot>
			</Menu>
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
