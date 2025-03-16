import { MindNode } from './MindNode';
import { hasChildren, HORIZONTAL_GAP, SWRadius, VERTICAL_GAP } from './utils';

export function computeSize(node: MindNode) {
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

export function layoutTree(node: MindNode, x: number, y: number) {
	node.x = x;
	node.y = y;
	node.UIBox.set({ x, y });
	const { width, height: h } = node.UIBox.boxBounds;
	const closed = node.children?.visible === false;
	if (node.switch)
		node.switch.set(
			closed
				? {
						x: x + width + 3,
						y: y + h / 2 - SWRadius * 2,
						opacity: 1,
						scale: 2
					}
				: {
						x: x + width + HORIZONTAL_GAP / 2 - SWRadius,
						y: y + h / 2 - SWRadius,
						scale: 1
					}
		);
	if (!hasChildren(node)) return;

	const childX = x + width + HORIZONTAL_GAP;
	let childY = y + h / 2 - node.height / 2;

	for (const child of node.children.attached) {
		const { height } = child.UIBox.boxBounds;
		childY += child.height / 2 - height / 2;
		if (childY === y && height < h) childY += (h - height) / 2;
		layoutTree(child, childX, childY);
		childY += child.height / 2 + height / 2 + VERTICAL_GAP;
	}
}
