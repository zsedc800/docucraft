import { Bounds, ILeafer, IUI, LeafBoundsHelper } from 'leafer-ui';
import { IMindNode } from '../interface';
import { MindNode } from '../MindNode';

let uniqueIdCounter = 1000;
export function generateUniqueId(prefix = 'mind_') {
	uniqueIdCounter++;
	const base36 = uniqueIdCounter.toString(36);
	const randomPart = Math.random().toString(36).substring(2, 4);
	return prefix + randomPart + base36;
}

export function hasChildren(node: IMindNode, ignoreVisible = false) {
	return !!(
		node.children &&
		(ignoreVisible ? ignoreVisible : node.children.visible !== false) &&
		node.children.attached?.length
	);
}

export const HORIZONTAL_GAP = 20;
export const VERTICAL_GAP = 20;
export const SWRadius = 6;

export function scrollIntoView(node: IUI, leafer: ILeafer) {
	const padding = 20;
	const limitBounds = leafer.canvas.bounds.clone(),
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

export function getDepth(node: MindNode) {
	let depth = 0,
		p = node.parent;
	while (p) {
		p = p.parent;
		depth++;
	}
	return depth;
}
