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
	UI: { text: IUI };
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
		if (id === 'rootTopic') this.initYNode();
	}

	initYNode() {
		const yNode = mindNodeToYMap(this);
		yNodes.set(this.id, yNode);
	}

	setTitle(title: string) {
		this.title = title;
		const yNode = yNodes.get(this.id);
		// const yTitle = yNode.get('title') as Y.Text;
		yNode.set('title', title);
		// yTitle.delete(0, yTitle.length);
		// yTitle.insert(0, title);
	}

	slice(from: number, to: number) {
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
		node.initYNode();
	}
	insertBefore(newNode: MindNode, referenceNode: MindNode) {
		const {
			children: { attached }
		} = this;
		const index = attached.indexOf(referenceNode);
		attached.splice(index, 0, newNode);
		newNode.initYNode();
	}

	insertAfter(newNode: MindNode, referenceNode: MindNode) {
		const {
			children: { attached }
		} = this;
		const index = attached.indexOf(referenceNode);
		attached.splice(index + 1, 0, newNode);
		newNode.initYNode();
	}
	near() {}
}
