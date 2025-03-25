import { Group, IPathInputData, Line, Path } from 'leafer-ui';
import { MindNode } from './MindNode';
import { ColorItem } from './theme';
import { hasChildren } from './utils';

export function drawBeizerline(
	[startX, startY, endX, endY]: number[],
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

export function drawPolyline(
	[startX, startY, endX, endY]: number[],
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

export function renderTree(
	node: MindNode,
	leafer: Group,
	{ depth = 0, colors }: { depth?: number; colors?: ColorItem } = {}
) {
	const { width, height } = node.UIBox.boxBounds;
	leafer.add(node.UIBox);
	if (node.switch) leafer.add(node.switch);
	if (!hasChildren(node)) return;
	node.children.attached?.forEach((child, i) => {
		const { height: h } = child.UIBox.boxBounds;
		const startX = node.x + width / 2;
		const startY = node.y + height / 2;
		const endX = child.x;
		const endY = child.y + h / 2;
		const colorItem = colors || child.theme.colors;
		const line = depth
			? drawPolyline([node.x + width, startY, endX, endY], {
					stroke: colorItem.bgColor
				})
			: drawBeizerline([startX, startY, endX, endY], {
					stroke: colorItem.bgColor
				});
		node.UILines[i] = line;
		leafer.add(line);
		renderTree(child, leafer, {
			depth: depth + 1,
			colors: colorItem
		});
	});
}
