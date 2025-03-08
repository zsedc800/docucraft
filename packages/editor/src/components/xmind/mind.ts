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
	IPathInputData,
	IUI
} from 'leafer-ui';
import '@leafer-in/viewport';
import { IMindNode, IMindRoot, IRect, NodeChildren } from './interface';
import { baseColors } from './theme';
import { generateUniqueId } from './utils';

type ColorItem = (typeof baseColors)[number];

interface MindNode extends IRect, IMindNode {
	parent?: MindNode;
	children?: NodeChildren<MindNode>;
	UIBox: IUI;
	theme?: {
		colors?: ColorItem;
	};
}

const NODE_WIDTH = 60;
const NODE_HEIGHT = 24;
const HORIZONTAL_GAP = 40;
const VERTICAL_GAP = 20;

function hasChildren(node: IMindNode) {
	return !!(
		node.children &&
		node.children.visible !== false &&
		node.children.attached?.length
	);
}

function computeTreeSize(node: MindNode) {
	if (!hasChildren(node)) {
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
	node.UIBox.set({ x, y });
	if (!hasChildren(node)) return;

	const { width: NODE_WIDTH, height: NODE_HEIGHT } = node.UIBox.boxBounds;
	// const NODE_HEIGHT = node.UIBox.__.height;
	console.log(NODE_HEIGHT, NODE_WIDTH);

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
	// const rect = new Box({
	// 	x: node.x,
	// 	y: node.y,
	// 	width: NODE_WIDTH,
	// 	height: NODE_HEIGHT,
	// 	fill: colors ? colors.bgColor : 'orange',
	// 	cornerRadius: 5,
	// 	children: [
	// 		{
	// 			tag: 'Text',
	// 			text: node.title,
	// 			fill: colors ? colors.color : 'black',
	// 			textAlign: 'left',
	// 			verticalAlign: 'top'
	// 		}
	// 	]
	// });

	const { width: NODE_WIDTH, height: NODE_HEIGHT } = node.UIBox.boxBounds;
	leafer.add(node.UIBox);
	node.children?.attached?.forEach((child, i) => {
		const startX = node.x + NODE_WIDTH / 2;
		const startY = node.y + NODE_HEIGHT / 2;
		const endX = child.x;
		const endY = child.y + NODE_HEIGHT / 2;
		// const { length } = baseColors;
		const colorItem = colors || child.theme.colors;

		leafer.add(
			depth
				? drawPolyline([node.x + NODE_WIDTH, startY, endX, endY], {
						stroke: colorItem.bgColor
					})
				: drawBeizerline([startX, startY, endX, endY], {
						stroke: colorItem.bgColor
					})
		);
		renderTree(child, leafer, {
			depth: depth + 1,
			colors: colorItem
		});
	});
}

function buildMindNode(
	node: IMindNode,
	{ colors }: { colors?: ColorItem } = {}
) {
	const { children, title, ...rest } = node;

	const UIBox = new Box({
		fill: colors ? colors.bgColor : 'orange',
		cornerRadius: 5,
		children: [
			{
				tag: 'Text',
				text: node.title,
				fill: colors ? colors.color : 'black',
				textAlign: 'left',
				verticalAlign: 'top',
				padding: [4, 8]
			}
		]
	});

	const { width, height } = UIBox.boxBounds;
	console.log(width, height, '1');

	const { length } = baseColors;
	const mindNode: MindNode = {
		...rest,
		id: generateUniqueId(),
		title,
		x: 0,
		y: 0,
		width,
		height,
		UIBox,
		children: {
			...children,
			attached: []
		},
		theme: { colors }
	};

	if (hasChildren(node)) {
		let totalHeight = 0,
			maxWidth = 0;
		mindNode.children.attached = children.attached.map((child, i) => {
			const node = buildMindNode(child, {
				colors: colors || baseColors[i % length]
			});
			totalHeight += node.height + VERTICAL_GAP;
			maxWidth = Math.max(maxWidth, node.width);
			node.parent = mindNode;
			return node;
		});
		mindNode.width = width + HORIZONTAL_GAP + maxWidth;
		mindNode.height = Math.max(height, totalHeight - VERTICAL_GAP);
	}
	return mindNode;
}

export class Mind {
	frame: Frame;
	app: App;
	group: Group;
	root: MindNode;
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

	parseJSON(root: IMindRoot) {
		this.root = buildMindNode(root.rootTopic);
		this.render();
	}

	render() {
		this.app.stop();
		const { root } = this;
		// computeTreeSize(root);
		layoutTree(root, 200, 200);
		renderTree(root, this.group);
		this.app.start();
	}

	destroy() {
		this.app.destroy();
	}
}
