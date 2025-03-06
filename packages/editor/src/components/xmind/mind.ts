import { App, Box, Frame, Group, Leafer, Line, Rect, Text } from 'leafer-ui';
import '@leafer-in/viewport';
import { IMindNode, IMindRoot } from './interface';

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
const HORIZONTAL_GAP = 80;
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
	console.log(node, x, y, 'node');
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

function renderTree(node: MindNode, leafer: Group) {
	const rect = new Box({
		x: node.x,
		y: node.y,
		width: NODE_WIDTH,
		height: NODE_HEIGHT,
		fill: 'orange',
		cornerRadius: 5,
		children: [
			{
				tag: 'Text',
				text: node.title,
				fill: 'black',
				textAlign: 'left',
				verticalAlign: 'top'
			}
		]
	});

	leafer.add(rect);
	node.children?.attached?.forEach((child) => {
		leafer.add(
			new Line({
				points: [
					node.x + NODE_WIDTH / 2,
					node.y + NODE_HEIGHT / 2,
					child.x,
					child.y + NODE_HEIGHT / 2
				],
				curve: 0.5,
				strokeWidth: 3,
				stroke: '#32cd79',
				zIndex: -1
			})
		);
		renderTree(child, leafer);
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
