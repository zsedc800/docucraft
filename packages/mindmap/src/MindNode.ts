import { IBoundsData, IUI } from 'leafer-ui';
import * as Y from 'yjs';
import { IMindNode, NodeChildren } from './interface';
import { ColorItem } from './theme';
import { Slice } from './slice';
import { mindNodeInstances, mindNodeToYMap } from './collaboration';
import { MindMap } from './mindMap';
import { swap } from './utils';

export class MindNode implements IBoundsData, IMindNode {
	x: number;
	y: number;
	width: number;
	height: number;
	parentId?: string;
	structureClass?: string;
	children?: NodeChildren<MindNode>;
	mindMap: MindMap;
	yNode?: Y.Map<any>;
	theme: { colors?: ColorItem } = {};
	style: { marginBottom?: number; gap?: number } = {};
	UI: { text: IUI };
	UILines: IUI[] = [];
	switch?: IUI;
	parent?: MindNode;
	size = 1;
	constructor(
		public id: string,
		public title: string,
		public UIBox: IUI,
		data: Partial<MindNode> = {}
	) {
		for (const key of Object.keys(data)) this[key] = data[key];
		mindNodeInstances.set(id, this);
		if (id === 'rootTopic') this.initYNode();
	}

	private collabrate(fn: (e: MindMap['collaborate']) => void) {
		const { collaborate } = this.mindMap;
		if (collaborate) fn(collaborate);
	}

	initYNode(pos: number = -1) {
		this.collabrate(({ mindmap, doc }) => {
			const yNode = mindNodeToYMap(this);
			// yNode.toJSON();
			// yNodes.set(this.id, yNode);
			this.yNode = yNode;
			if (pos < 0) {
				mindmap.set(this.id, yNode);
				delete this.yNode;

				return;
			}
			// const parent = this.parent;
			const parent = this.parent.yNode || mindmap.get(this.parent.id);
			// yNodes.get(this.parent.id);
			console.log(parent == mindmap.get(this.parent.id), 'ppr');

			const children = parent.get('children') as Y.Array<Y.Map<any>>;
			// console.log(children, parent, this.parentId, 'xxx');

			children.insert(pos, [yNode]);
		});
	}

	setTitle(title: string) {
		this.title = title;
		this.collabrate(({}) => {
			// const yNode = yNodes.get(this.id);
			// yNode.set('title', title);
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
		attached.splice(index, 1);
		this.collabrate(({}) => {
			// this.yNode!.get('children').delete(index);
			// 	const { id } = attached[index];
			// 	const yNode = yNodes.get(id);
			// 	const children = yNode.get('children') as Y.Array<string>;
			// 	children.delete(index);
			// yNodes.delete(id);
			// for (let i = index + 1; i < attached.length; i++) {
			// 	const child = attached[i];
			// 	const yNode = yNodes.get(child.id);
			// 	yNode.set('pos', i - 1);
			// }
		});
	}
	appendChild(node: MindNode) {
		const {
			children: { attached }
		} = this;
		const { length } = attached;
		attached.push(node);
		node.initYNode(length);
	}
	insertBefore(newNode: MindNode, referenceNode: MindNode) {
		const {
			children: { attached }
		} = this;
		const index = attached.indexOf(referenceNode);
		attached.splice(index, 0, newNode);
		newNode.initYNode(index);
	}

	insertAfter(newNode: MindNode, referenceNode: MindNode) {
		const {
			children: { attached }
		} = this;
		const index = attached.indexOf(referenceNode);
		attached.splice(index + 1, 0, newNode);
		newNode.initYNode(index + 1);
	}
	insertChild(newNode: MindNode, index: number) {
		this.children.attached.splice(index, 0, newNode);
		newNode.initYNode(index);
	}

	moveNode(targetNode: MindNode, index: number) {
		const { parent } = this;
		if (!parent) return;
		const {
			children: { attached }
		} = parent;
		const i = this.index();
		if (parent === targetNode) {
			swap(attached, i, index);
		} else {
		}
	}
	near() {}

	index(depth: number = -1) {
		return this.parent.children.attached.indexOf(this);
	}

	nextSibling() {
		const { children: { attached = [] } = {} } = this.parent || {};
		const index = attached.indexOf(this);
		return attached[index + 1];
	}

	get length() {
		return this.children?.attached?.length || 0;
	}

	pick({ x, y }: { x: number; y: number }): {
		node?: MindNode;
		parent?: MindNode;
	} {
		const {
			x: x1,
			y: y1,
			width,
			height,
			UIBox: {
				boxBounds: { width: w, height: h }
			},
			children
		} = this;
		const y2 = y1 + h / 2 - height / 2;
		if (!(x > x1 && x < x1 + width && y > y2 && y < y2 + height)) return {};
		if (x > x1 && x < x1 + w && y > y1 && y < y1 + h)
			return { node: this, parent: this.parent };

		for (const child of children?.attached) {
			const { node, parent } = child.pick({ x, y });
			if (node) {
				return { node, parent };
			} else if (parent) return { parent };
		}

		return { parent: this };
	}
}
