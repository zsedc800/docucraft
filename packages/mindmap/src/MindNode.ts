import { IBoundsData, IUI } from 'leafer-ui';
import { IMindNode, NodeChildren } from './interface';
import { ColorItem } from './theme';
import { Slice } from './slice';
import * as Y from 'yjs';
import {
	doc,
	mindNodeInstances,
	mindNodeToYMap,
	yNodes
} from './collaboration';

export class MindNode implements IBoundsData, IMindNode {
	x: number;
	y: number;
	width: number;
	height: number;
	parentId?: string;
	structureClass?: string;
	children?: NodeChildren<MindNode>;
	yNode: Y.Map<any>;
	theme: { colors?: ColorItem } = {};
	style: { marginBottom?: number; gap?: number } = {};
	switch?: IUI;
	parent?: MindNode;
	size = 1;
	constructor(
		readonly id: string,
		public title: string,
		public UIBox: IUI,
		data: Partial<MindNode> = {}
	) {
		for (const key of Object.keys(data)) this[key] = data[key];
		mindNodeInstances.set(id, this);
		this.yNode = mindNodeToYMap(this);
		yNodes.set(id, this.yNode);
		this.yNode.observe((event) => {
			event.changes.keys.forEach((change) => {
				console.log(change, 'ccc');
			});
		});
	}

	setTitle(title: string) {
		console.log('setTitle');

		this.title = title;
		// doc.transact(() => {
		// 	yNodes.get(this.id).set('title', title);
		// });
		// const node = yNodes.get(this.id);
		this.yNode.set('title', title);
	}

	slice(from: number, to: number) {
		console.log();
		return new Slice([]);
	}
	removeChild(node: MindNode) {
		const {
			children: { attached }
		} = this;
		const index = attached.indexOf(node);
		attached.splice(index, 1);
	}
	appendChild(node: MindNode) {
		this.children.attached.push(node);
	}
	insertBefore(newNode: MindNode, referenceNode: MindNode) {
		const {
			children: { attached }
		} = this;
		const index = attached.indexOf(referenceNode);
		attached.splice(index, 0, newNode);
	}

	insertAfter(newNode: MindNode, referenceNode: MindNode) {
		const {
			children: { attached }
		} = this;
		const index = attached.indexOf(referenceNode);
		attached.splice(index + 1, 0, newNode);
	}
	near() {}
}
