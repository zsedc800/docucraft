import { App, ILeaf, IUI, Leafer, PointerEvent, Rect } from 'leafer-ui';
import { MindNode } from './MindNode';
import { MindMap } from './mindMap';
import { drawBeizerline, drawPolyline } from './renderer';

function shadowNode(node: MindNode, opacity = 0.3) {
	const { parent, UIBox, children } = node;

	const index = parent.children.attached.indexOf(node);
	parent.UILines[index].opacity = opacity;
	UIBox.opacity = opacity;
	for (const child of children.attached) shadowNode(child, opacity);
}

function getTargetNode(target: ILeaf) {
	let cursor: ILeaf | undefined = target;
	while (cursor && !cursor.data.node) cursor = cursor.parent;
	return [cursor, cursor?.data.node] as const;
}

export function drag(mindMap: MindMap) {
	const { app, group } = mindMap;
	let dragNode: MindNode = null,
		ghostNode: ILeaf = null,
		dragStart = false,
		targetNode: MindNode = null,
		targetPos = null,
		offsetX = 0,
		offsetY = 0,
		line: IUI = null,
		rect: IUI = null;
	app.on(PointerEvent.DOWN, (e: PointerEvent) => {
		const [cursor, node] = getTargetNode(e.target);
		dragNode = node;

		if (cursor && dragNode.parent) {
			ghostNode = cursor.clone();

			cursor.parent.add(ghostNode as IUI);
			offsetX = e.x - ghostNode.__.x;
			offsetY = e.y - ghostNode.__.y;
		}
	});

	app.on(PointerEvent.MOVE, (e: PointerEvent) => {
		if (e.buttons !== 1 || !ghostNode) return;
		const { x, y } = e;
		if (!dragStart) {
			dragStart = true;
			shadowNode(dragNode, 0.3);
		}
		// const res = app.pick({ x, y }, { through: true });
		const data = group.getInnerPoint({ x, y });
		ghostNode.set({ x: x - offsetX, y: y - offsetY });
		const { node, parent } = mindMap.root.pick(data);
		targetNode = parent;
		targetPos = node?.index() || 0;
		if (!node || !node.parent || node === dragNode) return;
		const next = node.nextSibling();
		if (next) {
			const { x, y } = next;
			const dy = (y + node.y) / 2;
			const { width, height } = parent.UIBox.boxBounds;
			line?.remove();
			rect?.remove();
			line = parent.parent
				? drawPolyline([parent.x + width, parent.y + height / 2, x, dy + 8], {
						stroke: '#836DFF'
					})
				: drawBeizerline(
						[parent.x + width / 2, parent.y + height / 2, x, dy + 8],
						{ stroke: '#836DFF', zIndex: -1 }
					);
			rect = new Rect({
				x,
				y: dy,
				width: 32,
				height: 16,
				fill: '#836DFF',
				cornerRadius: 5
			});
			group.add([line, rect]);
		}
	});

	app.on(PointerEvent.UP, (e) => {
		dragStart = false;
		dragNode && dragNode.parent && shadowNode(dragNode, 1);
		ghostNode?.remove();
		line?.remove();
		rect?.remove();

		if (targetNode && dragNode) {
			// dragNode.parent.removeChild(dragNode);
			// dragNode.id = generateUniqueId();
			// targetNode.insertChild(dragNode, targetPos);
			mindMap.render();
		}
		dragNode = null;
		line = null;
		rect = null;
		ghostNode = null;
		offsetX = offsetY = 0;
		targetNode = null;
	});
}
