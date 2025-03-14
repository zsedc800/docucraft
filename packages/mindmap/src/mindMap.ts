import {
	App,
	Box,
	Frame,
	Group,
	Path,
	IPathInputData,
	IUI,
	DragEvent,
	KeyEvent,
	ILeafer,
	Bounds,
	ILeaf,
	LeafBoundsHelper,
	Line
} from 'leafer-ui';
import '@leafer-in/viewport';
import { EditorEvent } from './editor';
import './editor/textEditor';
import { IMindNode, IMindRoot, IRect, NodeChildren } from './interface';
import { baseColors } from './theme';
import { generateUniqueId } from './utils';
import { MindMapSelection } from './selection';

// Debug.showBoundsView = true;
// Debug.showHitView = true;
// Debug.enable = true;

type ColorItem = (typeof baseColors)[number];

export interface MindNode extends IRect, IMindNode {
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
	const xh =
		height === node.height ? node.children.attached[0].height : node.height;
	const childX = x + width + HORIZONTAL_GAP;
	let childY = y - node.height / 2 + height / 2;

	for (const child of node.children.attached) {
		// const { height } = child.UIBox.boxBounds;
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

	const controlX = startX + dx * 0.2;
	const controlY = startY;
	const path = `M ${startX} ${startY} C ${controlX} ${controlY}, ${controlX} ${endY}, ${endX} ${endY}`;

	return new Line({
		path,
		strokeWidth: 2,
		stroke: '#32cd79',
		zIndex: -1,
		strokeAlign: 'center',
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

let i = 0;

function getBaseColor() {
	const { length } = baseColors;
	return baseColors[i++ % length];
}

function computeSize(node: MindNode) {
	const { children } = node;
	const { width, height } = node.UIBox.boxBounds;
	if (!hasChildren(node)) {
		node.width = width;
		node.height = height;
		return;
	}
	let totalHeight = 0,
		maxWidth = 0;

	for (const child of children.attached) {
		computeSize(child);
		totalHeight += child.height + VERTICAL_GAP;
		maxWidth = Math.max(maxWidth, child.width);
	}
	node.width = width + HORIZONTAL_GAP + maxWidth;
	node.height = Math.max(height, totalHeight - VERTICAL_GAP);
}

function buildMindNode(node: IMindNode, parent?: MindNode) {
	const { children } = node;
	const mindNode = insertNode(node, parent);
	if (hasChildren(node)) {
		mindNode.children.attached = children.attached.map((child, i) => {
			const node = buildMindNode(child, mindNode);
			node.parent = mindNode;
			return node;
		});
	}
	return mindNode;
}

function scrollIntoView(node: IUI, leafer: ILeafer) {
	const padding = 20;
	const limitBounds = leafer.canvas.bounds.clone(),
		// .shrink(padding !== undefined ? padding : 30)
		bounds = new Bounds();

	const { zoomLayer } = leafer;
	const { x, y, scaleX, scaleY } = zoomLayer;
	const data = { x, y, scaleX, scaleY };
	bounds.setListWithFn([node], LeafBoundsHelper.worldBounds);
	const { width, height } = bounds;

	let moveX = 0,
		moveY = 0;

	if (bounds.x < limitBounds.x) moveX += limitBounds.x + padding - bounds.x;
	else if (bounds.x + width > limitBounds.x + limitBounds.width)
		moveX += limitBounds.x + limitBounds.width - padding - bounds.x - width;
	if (bounds.y < limitBounds.y) moveY += limitBounds.y + padding - bounds.y;
	else if (bounds.y + height > limitBounds.y + limitBounds.height)
		moveY += limitBounds.y + limitBounds.height - padding - bounds.y - height;

	data.x += moveX;
	data.y += moveY;

	zoomLayer.set(data);
}

const cornerRadius = 5;
function insertNode({ title, ...rest }, parent: MindNode) {
	const { theme: { colors: c } = {} } = parent || {};
	const colors =
		c ||
		(parent
			? getBaseColor()
			: ({ bgColor: '#455A64', color: '#FFFFFF' } as ColorItem));
	let depth = 0,
		p = parent;
	while (p) {
		depth++;
		p = p.parent;
	}
	const UIBox = new Box({
		cornerRadius,
		editable: true,
		fill: colors ? colors.bgColor : 'orange',
		children: [
			{
				cornerRadius,
				tag: 'Text',
				padding: depth < 2 ? [6, 12] : [4, 8],
				text: title,

				fontSize: depth > 0 ? (depth === 1 ? 18 : 14) : 20,
				fill: colors ? colors.color : 'black',
				textAlign: 'left',
				verticalAlign: 'top',
				editable: true
			}
		]
	});

	// if (!colors) {
	// 	UIBox.on(DragEvent.DRAG, ({ moveX, moveY }: DragEvent) => {
	// 		UIBox.parent.move(moveX, moveY);
	// 	});
	// }

	const { width, height } = UIBox.boxBounds;
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
			attached: []
		},
		theme: { colors: parent ? colors : void 0 }
	};

	UIBox.data.node = mindNode;
	mindNode.parent = parent;
	return mindNode;
}

// function adjustSize(node: MindNode) {}

export class MindMap {
	frame: Frame;
	app: App;
	group: Group;
	root: MindNode;
	selection: MindMapSelection;
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
				selectorPadding: 1.5,
				rect: { opacity: 0 },
				hoverStyle: { stroke: '#D4C5FF' }
			},
			tree: { type: 'design' }
		});
		this.frame = new Frame({ fill: 'transparent', draggable: true });
		this.app.tree.add(this.frame);
		this.group = new Group({});
		this.frame.add(this.group);
		this.selection = new MindMapSelection();
		// const addButton = Box.one({
		// 	cursor: 'pointer',

		// 	children: [
		// 		Path.one({
		// 			width: 30,
		// 			height: 30,
		// 			path: 'M 15 0 A 15 15 0 1 1 14.99 0 M 15 5 V 25 M 5 15 H 25',
		// 			stroke: '#999',
		// 			fill: 'transparent',
		// 			scale: 0.5
		// 		})
		// 	]
		// });
		const {
			app: { editor }
		} = this;

		editor.on(EditorEvent.SELECT, (e) => {
			const ele: IUI | undefined = e.value;
			let node = ele;
			while (node && node.tag !== 'Box') node = node.parent;
			this.selection = new MindMapSelection(node?.data.node);
		});

		this.app.on(KeyEvent.DOWN, (e) => {
			switch (e.key) {
				case 'ArrowUp':
					return this.selectUp();
				case 'ArrowRight':
					return this.selectRight();
				case 'ArrowDown':
					return this.selectDown();
				case 'ArrowLeft':
					return this.selectLeft();
				case 'Tab':
					return this.addChild();
				case 'Enter':
					return this.addNextSibling();
				case 'Backspace':
				case 'Delete':
					return this.deleteSel();
			}
		});
	}

	deleteSel() {
		const { anchorNode } = this.selection;
		if (anchorNode && anchorNode.parent) {
			const {
				children: { attached }
			} = anchorNode.parent;
			const index = attached.indexOf(anchorNode);
			const next =
				index < attached.length - 1
					? attached[index + 1]
					: index > 0
						? attached[index - 1]
						: anchorNode.parent;
			attached.splice(index, 1);
			this.render();
			this.select(next);
		}
	}

	addNextSibling() {
		const { anchorNode } = this.selection;
		if (anchorNode && anchorNode.parent) {
			const { parent } = anchorNode;
			const {
				children: { attached }
			} = parent;
			const index = attached.indexOf(anchorNode);
			const node = insertNode({ title: '子主题' }, parent);
			attached.splice(index, 0, node);

			this.render();
		}
	}

	addChild() {
		const { anchorNode } = this.selection;
		if (anchorNode) {
			const { children } = anchorNode;
			const node = insertNode({ title: '子主题' }, anchorNode);
			children.attached.push(node);
			this.render();
			this.select(node);
		}
	}

	selectUp() {
		const { anchorNode } = this.selection;

		if (anchorNode && anchorNode.parent) {
			const {
				parent: { children: { attached = [] } = {} }
			} = anchorNode;
			const index = attached.indexOf(anchorNode);
			if (index > 0) this.select(attached[index - 1]);
		}
	}
	selectDown() {
		const { anchorNode } = this.selection;
		if (anchorNode && anchorNode.parent) {
			const {
				parent: { children: { attached = [] } = {} }
			} = anchorNode;
			const index = attached.indexOf(anchorNode);
			if (index < attached.length - 1) this.select(attached[index + 1]);
		}
	}
	selectLeft() {
		const { anchorNode } = this.selection;
		if (anchorNode && anchorNode.parent) {
			const { parent } = anchorNode;
			this.select(parent);
		}
	}

	selectRight() {
		const { anchorNode } = this.selection;

		if (anchorNode && anchorNode.children) {
			const { children: { visible = true, attached = [] } = {} } = anchorNode;
			if (visible && attached.length) this.select(attached[0]);
		}
	}

	select(node: MindNode) {
		this.app.editor.select(node.UIBox);
		scrollIntoView(node.UIBox, this.app.tree);
	}

	parseJSON(root: IMindRoot) {
		this.root = buildMindNode(root.rootTopic);
		this.render();
		this.selection = new MindMapSelection(this.root);
		this.select(this.root);
	}

	render() {
		this.app.stop();
		const { root } = this;
		this.group.removeAll();
		computeSize(root);
		layoutTree(root, 200, 200);

		renderTree(root, this.group);
		this.app.start();
	}

	destroy() {
		this.app.destroy();
	}
}
