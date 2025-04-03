import * as Y from 'yjs';
import { MindNode } from '../MindNode';
import { WebsocketProvider } from 'y-websocket';

export function mindNodeToYMap(node: MindNode): Y.Map<any> {
	const yNode = new Y.Map();

	yNode.set('id', node.id);
	yNode.set('title', node.title);
	yNode.set('parentId', node.parentId);
	// yNode.set('size', node.size);
	// if (node.parent) {
	// 	const index = node.parent.children.attached.indexOf(node);

	// 	yNode.set('pos', index);
	// }

	const yChildren = new Y.Array<Y.Map<any>>();
	if (node.children) {
		yNode.set('childrenVisible', node.children.visible);
		// for (const child of node.children.attached) {
		// 	yChildren.push([mindNodeToYMap(child)]);
		// }
	}
	yNode.set('children', yChildren);

	return yNode;
}

export const mindNodeInstances = new Map<string, MindNode>();

export function initCollaborate(serverAddress, docName) {
	const doc = new Y.Doc();
	// const provider = new WebsocketProvider(serverAddress, docName, doc);
	// // 监听连接状态
	// provider.on('status', (event) => {
	// 	console.log('🌐 WebSocket 状态:', event.status);
	// });
	// provider.on('sync', (isSynced) => {
	// 	console.log(`🔄 WebSocket Sync: ${isSynced ? '✅ 已同步' : '❌ 未同步'}`);
	// });
	const mindmap = doc.getMap<Y.Map<any>>('mindmap');
	// const yNodes = new Map<string, Y.Map<any>>();
	return {
		doc,
		mindmap
		// wsProvider: provider
	};
}
