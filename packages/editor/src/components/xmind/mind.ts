import {
	App,
	Box,
	Frame,
	Group,
	Path,
	Leafer,
	Line,
	Rect,
	Text,
	IPathInputData
} from 'leafer-ui';
import '@leafer-in/viewport';
import { IMindNode, IMindRoot } from './interface';
import { baseColors } from './theme';

interface IRect {
	x: number;
	y: number;
	width: number;
	height: number;
}

interface NodeChildren {
	visible?: boolean;
	attached?: MindNode[];
}

class MindNode implements IRect {
	id: string;
	parentId?: string;
	children?: NodeChildren;
	x: number;
	y: number;
	width: number;
	height: number;
	constructor(public title: string) {}
}

const NODE_WIDTH = 60;
const NODE_HEIGHT = 24;
const HORIZONTAL_GAP = 40;
const VERTICAL_GAP = 20;

function computeTreeSize(node: MindNode) {
	if (
		!node.children ||
		node.children.visible === false ||
		node.children.attached.length === 0
	) {
		node.width = NODE_WIDTH;
		node.height = NODE_HEIGHT;
		return;
	}
	let totalHeight = 0,
		maxWidth = 0;
	for (const child of node.children.attached) {
		computeTreeSize(child);
		totalHeight += child.height + VERTICAL_GAP;
		maxWidth = Math.max(maxWidth, child.width);
	}
	node.width = NODE_WIDTH + HORIZONTAL_GAP + maxWidth;
	node.height = Math.max(NODE_HEIGHT, totalHeight - VERTICAL_GAP);
}

function layoutTree(node: MindNode, x: number, y: number) {
	node.x = x;
	node.y = y;
	if (
		!node.children ||
		node.children.visible === false ||
		node.children.attached.length === 0
	)
		return;

	const childX = x + NODE_WIDTH + HORIZONTAL_GAP;
	let childY = y - node.height / 2 + NODE_HEIGHT / 2;

	for (const child of node.children.attached) {
		childY += child.height / 2 - NODE_HEIGHT / 2;
		layoutTree(child, childX, childY);
		childY += child.height / 2 + NODE_HEIGHT / 2 + VERTICAL_GAP;
	}
}

function drawBeizerline(
	[startX, startY, endX, endY],
	data: Partial<IPathInputData> = {}
) {
	const dx = endX - startX;
	const dy = endY - startY;

	const controlX = startX + dx * (0.3 + Math.abs(dy) / 500);
	const controlY = startY;
	return new Path({
		path: `M ${startX} ${startY} C ${controlX} ${controlY}, ${controlX} ${endY}, ${endX} ${endY}`,
		strokeWidth: 1.5,
		stroke: '#32cd79',
		zIndex: -1,
		...data
	});
}

function drawPolyline(
	[startX, startY, endX, endY],
	data: Partial<IPathInputData>
) {
	const midX = (startX + endX) / 2;
	const radius = 5;
	const path = `M ${startX} ${startY} H ${midX} `;
	return new Path({
		path:
			path +
			(endY === startY
				? `H ${endX}`
				: `V ${endY - (endY > startY ? 1 : -1) * radius} Q ${midX} ${endY} ${midX + radius} ${endY} H ${endX}`),
		strokeWidth: 1,
		stroke: '#32cd79',
		...data
	});
}

function renderTree(
	node: MindNode,
	leafer: Group,
	{
		depth = 0,
		colors
	}: { depth?: number; colors?: (typeof baseColors)[number] } = {}
) {
	const rect = new Box({
		x: node.x,
		y: node.y,
		width: NODE_WIDTH,
		height: NODE_HEIGHT,
		fill: colors ? colors.bgColor : 'orange',
		cornerRadius: 5,
		children: [
			{
				tag: 'Text',
				text: node.title,
				fill: colors ? colors.color : 'black',
				textAlign: 'left',
				verticalAlign: 'top'
			}
		]
	});

	leafer.add(rect);
	node.children?.attached?.forEach((child, i) => {
		const startX = node.x + NODE_WIDTH / 2;
		const startY = node.y + NODE_HEIGHT / 2;
		const endX = child.x;
		const endY = child.y + NODE_HEIGHT / 2;
		const { length } = baseColors;
		const colorItem = colors || baseColors[i % length];
		leafer.add(
			depth
				? drawPolyline([node.x + NODE_WIDTH, startY, endX, endY], {
						stroke: colorItem.borderColor
					})
				: drawBeizerline([startX, startY, endX, endY], {
						stroke: colorItem.borderColor
					})
		);
		renderTree(child, leafer, {
			depth: depth + 1,
			colors: colorItem
		});
	});
}

export class Mind {
	frame: Frame;
	app: App;
	group: Group;
	constructor(id: string | HTMLElement) {
		this.app = new App({
			view: id,

			tree: { type: 'design' }
		});
		this.frame = new Frame();
		this.app.tree.add(this.frame);
		this.group = new Group({ draggable: true });
		this.frame.add(this.group);
	}

	render(root: MindNode) {
		computeTreeSize(root);
		layoutTree(root, 200, 200);
		renderTree(root, this.group);
	}

	destroy() {
		this.app.destroy();
	}
}
