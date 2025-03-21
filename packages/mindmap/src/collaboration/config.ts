import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';
import * as Y from 'yjs';
import { MindNode } from '../MindNode';

export const doc = new Y.Doc();

const provider = new WebsocketProvider(
	'ws://localhost:3200/y-websocket',
	'mind-map',
	doc
);

console.log('WebSocket provider created');

// 监听连接状态
provider.on('status', (event) => {
	console.log('🌐 WebSocket 状态:', event.status);
});

provider.on('sync', (isSynced) => {
	console.log(`🔄 WebSocket Sync: ${isSynced ? '✅ 已同步' : '❌ 未同步'}`);
});

// 监听连接的 WebSocket
provider.ws.onopen = () => console.log('✅ WebSocket 已连接');
provider.ws.onerror = (err) => console.error('❌ WebSocket 连接错误:', err);
provider.ws.onclose = () => console.log('❌ WebSocket 连接关闭');

// const persistence = new IndexeddbPersistence('mind-map', doc);
// persistence.on('synced', (...args) => {
// 	console.log(args, 'xxx');
// });

export const yNodes = doc.getMap<Y.Map<any>>('nodes');
export const mindNodeInstances = new Map<string, MindNode>();
