import * as Y from 'yjs';
import { MindNode } from '../MindNode';

export function mindNodeToYMap(node: MindNode): Y.Map<any> {
	const yNode = new Y.Map();
	yNode.set('id', node.id);
	yNode.set('title', node.title);
	yNode.set('parentId', node.parentId);
	// yNode.set('size', node.size);
	if (node.parent) {
		const index = node.parent.children.attached.indexOf(node);

		yNode.set('pos', index);
	}

	const yChildren = new Y.Map();
	if (node.children) {
		yChildren.set('visible', node.children.visible);
	}
	yNode.set('children', yChildren);
	return yNode;
}

export * from './config';
