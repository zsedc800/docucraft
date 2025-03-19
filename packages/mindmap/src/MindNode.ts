import { IBoundsData, IUI } from 'leafer-ui';
import { IMindNode, NodeChildren } from './interface';
import { ColorItem } from './theme';
import { Slice } from './slice';

export class MindNode implements IBoundsData, IMindNode {
	x: number;
	y: number;
	width: number;
	height: number;
	parentId?: string;
	structureClass?: string;
	children?: NodeChildren<MindNode>;
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
