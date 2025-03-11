import {
	App,
	Box,
	Frame,
	Group,
	Path,
	IPathInputData,
	IUI,
	DragEvent
} from 'leafer-ui';
import '@leafer-in/viewport';
// import { EditorEvent } from '@leafer-in/editor';
import { EditorEvent, EditorScaleEvent } from './editor';
import { IMindNode, IMindRoot, IRect, NodeChildren } from './interface';
import { baseColors } from './theme';
import { generateUniqueId } from './utils';

// Debug.showBoundsView = true;
// Debug.showHitView = true;
// Debug.enable = true;

type ColorItem = (typeof baseColors)[number];

interface MindNode extends IRect, IMindNode {
	parent?: MindNode;
	children?: NodeChildren<MindNode>;
	UIBox: IUI;
	theme: {
		colors?: ColorItem;
	};
}

// const NODE_WIDTH = 60;
// const NODE_HEIGHT = 24;
const HORIZONTAL_GAP = 40;
const VERTICAL_GAP = 20;

function hasChildren(node: IMindNode) {
	return !!(
		node.children &&
		node.children.visible !== false &&
		node.children.attached?.length
	);
}

function layoutTree(node: MindNode, x: number, y: number) {
	node.x = x;
	node.y = y;
	node.UIBox.set({ x, y });
	if (!hasChildren(node)) return;

	const { width, height } = node.UIBox.boxBounds;

	const childX = x + width + HORIZONTAL_GAP;
	let childY = y - node.height / 2 + height / 2;

	for (const child of node.children.attached) {
		childY += child.height / 2 - height / 2;
		layoutTree(child, childX, childY);
		childY += child.height / 2 + height / 2 + VERTICAL_GAP;
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
	const { width, height } = node.UIBox.boxBounds;
	leafer.add(node.UIBox);
	node.children?.attached?.forEach((child, i) => {
		const startX = node.x + width / 2;
		const startY = node.y + height / 2;
		const endX = child.x;
		const endY = child.y + height / 2;
		const colorItem = colors || child.theme.colors;

		leafer.add(
			depth
				? drawPolyline([node.x + width, startY, endX, endY], {
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
		data: { node },
		cornerRadius: 5,
		editable: true,
		fill: colors ? colors.bgColor : 'orange',
		textBox: true,
		children: [
			{
				cornerRadius: 5,
				tag: 'Text',
				padding: [4, 8],
				text: node.title,
				fill: colors ? colors.color : 'black',
				textAlign: 'left',
				verticalAlign: 'top',
				editable: true
			}
		]
	});

	if (!colors) {
		UIBox.on(DragEvent.DRAG, ({ moveX, moveY }: DragEvent) => {
			UIBox.parent.move(moveX, moveY);
		});
	}

	const { width, height } = UIBox.boxBounds;

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

export class MindMap {
	frame: Frame;
	app: App;
	group: Group;
	root: MindNode;
	constructor(id: string | HTMLElement) {
		this.app = new App({
			view: id,
			editor: {
				moveable: false,
				buttonsDirection: 'right',
				// selector: false
				pointSize: 0,
				boxSelect: false,
				rotateable: false,
				rect: { opacity: 0 }
			},
			tree: { type: 'design' }
		});
		this.frame = new Frame({ fill: 'transparent', draggable: true });
		this.app.tree.add(this.frame);
		this.group = new Group({});
		this.frame.add(this.group);
		const addButton = Box.one({
			cursor: 'pointer',

			children: [
				Path.one({
					width: 30,
					height: 30,
					path: 'M 15 0 A 15 15 0 1 1 14.99 0 M 15 5 V 25 M 5 15 H 25',
					stroke: '#999',
					fill: 'transparent',
					scale: 0.5
				})
			]
		});
		const {
			app: { editor }
		} = this;

		addButton.on('click', (e) => {
			console.log(e, this.app.editor.target, 'xx');
		});
		editor.buttons.add(addButton);
		editor.on(EditorEvent.SELECT, (e) => {
			console.log(e, 'e');
		});

		editor.on(EditorScaleEvent.SCALE, (e) => {
			console.log(e, 'eee');
		});
	}

	parseJSON(root: IMindRoot) {
		this.root = buildMindNode(root.rootTopic);
		this.render();
	}

	render() {
		this.app.stop();
		const { root } = this;
		layoutTree(root, 200, 200);
		renderTree(root, this.group);
		this.app.start();
	}

	destroy() {
		this.app.destroy();
	}
}
