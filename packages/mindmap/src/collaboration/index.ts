import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MindNode } from '../MindNode';
import { IUI } from 'leafer-ui';

export function mindNodeToYMap(node: MindNode): Y.Map<any> {
	const yNode = new Y.Map();
	yNode.set('id', node.id);
	yNode.set('title', node.title);
	yNode.set('x', node.x);
	yNode.set('y', node.y);
	yNode.set('width', node.width);
	yNode.set('height', node.height);
	// yNode.set('parentId', node.parentId);
	// yNode.set('structureClass', node.structureClass);
	// yNode.set('theme', node.theme);
	// yNode.set('style', node.style);
	yNode.set('size', node.size);

	const yChildren = new Y.Map();
	if (node.children) {
		yChildren.set('visible', node.children.visible);
		// const yAttached = new Y.Array();
		// const attached = node.children.attached.map(mindNodeToYMap);
		// yAttached.push(attached);
	}
	yNode.set('children', yChildren);
	return yNode;
}

export function yMapToMindNode(yNode: Y.Map<any>, UIBox: IUI): MindNode {
	const id = yNode.get('id');
	const title = yNode.get('title');
	const x = yNode.get('x');
	const y = yNode.get('y');
	const width = yNode.get('width');
	const height = yNode.get('height');
	const parentId = yNode.get('parentId');
	const structureClass = yNode.get('structureClass');
	const theme = yNode.get('theme');
	const style = yNode.get('style');
	const size = yNode.get('size');

	const node = new MindNode(id, title, UIBox, {
		x,
		y,
		width,
		height,
		parentId,
		structureClass,
		theme,
		style,
		size
	});

	// 处理 children
	const yChildren = yNode.get('children');
	if (yChildren) {
	}

	return node;
}

export const doc = new Y.Doc();

const provider = new WebsocketProvider(
	'ws://localhost:3200/ws',
	'mind-map',
	doc
);

export const yNodes = doc.getMap<Y.Map<any>>('nodes');
export const mindNodeInstances = new Map<string, MindNode>();

yNodes.observe((event, tr) => {
	if (tr.local) return;
	console.log(event);

	event.changes.keys.forEach((change, id) => {
		console.log(change, id, 'changes');
	});
});
