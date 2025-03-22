import { IBoundsData, IUI } from 'leafer-ui';
import { IMindNode, NodeChildren } from './interface';
import { ColorItem } from './theme';
import { Slice } from './slice';
import { mindNodeInstances, mindNodeToYMap } from './collaboration';
import { MindMap } from './mindMap';

export class MindNode implements IBoundsData, IMindNode {
	x: number;
	y: number;
	width: number;
	height: number;
	parentId?: string;
	structureClass?: string;
	children?: NodeChildren<MindNode>;
	mindMap: MindMap;
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

	private collabrate(fn: (e: MindMap['collaborate']) => void) {
		if (!this.mindMap.collaborate) return;
		fn(this.mindMap.collaborate);
	}

	initYNode() {
		this.collabrate(({ yNodes }) => {
			const yNode = mindNodeToYMap(this);
			yNodes.set(this.id, yNode);
		});
	}

	setTitle(title: string) {
		this.title = title;
		this.collabrate(({ yNodes }) => {
			const yNode = yNodes.get(this.id);
			yNode.set('title', title);
			// const yTitle = yNode.get('title') as Y.Text;
			// yTitle.delete(0, yTitle.length);
			// yTitle.insert(0, title);
		});
	}

	set(key: Exclude<keyof IMindNode, 'id'>, value) {
		if (key === 'title') this.setTitle(value);
		else this[key] = value;
	}

	slice(from: number, to: number) {
		return new Slice([]);
	}
	removeChild(node: MindNode) {
		const {
			children: { attached }
		} = this;
		const index = attached.indexOf(node);
		this.collabrate(({ yNodes }) => {
			const { id } = attached[index];
			yNodes.delete(id);
			// for (let i = index + 1; i < attached.length; i++) {
			// 	const child = attached[i];
			// 	const yNode = yNodes.get(child.id);
			// 	yNode.set('pos', i - 1);
			// }
		});
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

	index(depth: number = -1) {
		return this.parent.children.attached.indexOf(this);
	}
}
