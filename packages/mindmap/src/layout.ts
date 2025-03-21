import { MindNode } from './MindNode';
import { hasChildren, HORIZONTAL_GAP, SWRadius, VERTICAL_GAP } from './utils';

export function computeSize(node: MindNode) {
	const { children } = node;
	node.UI.text.set({ text: node.title });
	const { width, height } = node.UIBox.boxBounds;
	if (!hasChildren(node)) {
		node.width = width;
		node.height = height;
		return;
	}
	let totalHeight = 0,
		maxWidth = 0;
	const {
		style: { gap, marginBottom }
	} = node;
	for (const child of children.attached) {
		computeSize(child);
		totalHeight += child.height + marginBottom;
		maxWidth = Math.max(maxWidth, child.width);
	}
	node.width = width + gap + maxWidth;
	node.height = Math.max(height, totalHeight - marginBottom);
}

export function layoutTree(node: MindNode, x: number, y: number) {
	node.x = x;
	node.y = y;
	node.UIBox.set({ x, y });
	const { width, height: h } = node.UIBox.boxBounds;
	const {
		style: { gap, marginBottom }
	} = node;
	const closed = node.children?.visible === false;
	if (node.switch)
		node.switch.set(
			closed
				? {
						x: x + width + 3,
						y: y + h / 2 - SWRadius * 1.5,
						opacity: 1,
						scale: 1.5
					}
				: {
						x: x + width + gap / 2 - SWRadius,
						y: y + h / 2 - SWRadius,
						scale: 1
					}
		);
	if (!hasChildren(node)) return;

	const childX = x + width + gap;
	let childY = y + h / 2 - node.height / 2;
	const childHeight =
		node.children.attached.reduce(
			(pre, { height }) => pre + height + marginBottom,
			0
		) - marginBottom;

	if (h === node.height) childY += h / 2 - childHeight / 2;

	for (const child of node.children.attached) {
		const { height } = child.UIBox.boxBounds;
		childY += child.height / 2 - height / 2;
		layoutTree(child, childX, childY);
		childY += child.height / 2 + height / 2 + marginBottom;
	}
}
