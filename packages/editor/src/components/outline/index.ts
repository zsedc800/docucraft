import { Node, ResolvedPos } from 'prosemirror-model';
import {
	Plugin,
	PluginKey,
	TextSelection,
	Transaction
} from 'prosemirror-state';
import { DecorationSet, DecorationSource } from 'prosemirror-view';
import { ReplaceStep } from 'prosemirror-transform';
import { HeadingView } from '../heading';
import {
	convertToAlphabet,
	convertToChineseNumber,
	convertToRoman,
	generateUniqueId
} from '../../utils';
import { addChild, findOffsetInParent, nodesBetween } from './utils';

export class OutlineNode {
	children: OutlineNode[];
	parent: OutlineNode | null;
	constructor(
		public id: string,
		public node: HeadingView | null,
		public level: number
	) {
		this.children = [];
		this.parent = null;
	}
}

export type OrderType = 0 | 1 | 2 | 3;

export class OutlineTree {
	root: OutlineNode;
	private map: Map<string, OutlineNode>;
	orderType: OrderType;
	constructor() {
		this.root = new OutlineNode('root', null, 0);
		this.map = new Map();
		this.orderType = 0;
	}
	setOrderType(type: OrderType) {
		this.orderType = type;
		this.updateHeading();
	}

	insertOrUpdate(heading: HeadingView, $pos: ResolvedPos) {
		const { node, id } = heading;
		const level = node.attrs.level;

		const parent = $pos.parent;
		let outlineNode = this.findNodeById(id);
		if (outlineNode) {
			outlineNode.node = heading;
			return outlineNode;
		}
		outlineNode = new OutlineNode(id, heading, level);
		this.map.set(id, outlineNode);
		let index = $pos.index($pos.depth);
		let count = 0,
			lastLevel = Infinity;

		nodesBetween(parent, index + 1, parent.childCount - 1, ({ attrs }) => {
			if (attrs.level <= level) return false;
			const childNode = this.findNodeById(attrs.blockId);
			if (childNode) addChild(outlineNode, childNode);
			else console.warn('can not found node');
		});

		lastLevel = Infinity;
		count = -1;

		console.log(index, $pos, '$pos');

		nodesBetween(
			parent,
			index - 1,
			0,
			({ attrs }, i) => {
				const childNode = this.findNodeById(attrs.blockId);
				if (!childNode) {
					console.warn('can not found node');
					return;
				}
				if (childNode.level < level) {
					addChild(
						childNode,
						outlineNode,
						findOffsetInParent(parent, i + 1, index - 1)
					);
				} else if (childNode.level === level) {
					const parentNode = childNode.parent!;
					const index = parentNode.children.indexOf(childNode);
					if (index > -1) addChild(parentNode, outlineNode, index + 1);
				}
				return false;
			},
			false
		);

		if (!outlineNode.parent)
			addChild(
				this.root,
				outlineNode,
				findOffsetInParent(parent, 0, index - 1)
			);

		// const children = outlineNode.parent!.children;
		// index = children.indexOf(outlineNode);
		// // 调整同级节点中实际小于该级别的节点，
		// for (let i = index - 1; i >= 0; i--) {
		// 	const node = children[i];
		// 	let l = node.level,
		// 		newNode = node;
		// 	while (l > level) {
		// 		l--;
		// 		const t = new OutlineNode(generateUniqueId(), null, l);
		// 		addChild(t, newNode);
		// 		newNode = t;
		// 	}
		// 	children[i] = newNode;
		// 	newNode.parent = outlineNode.parent;
		// }

		return outlineNode;
	}

	findNodeById(id: string) {
		return this.map.get(id) || null;
	}

	removeById(id: string) {
		const outlineNode = this.findNodeById(id);
		if (outlineNode) {
			const children = outlineNode.parent?.children || [];
			const index = children.indexOf(outlineNode);
			children.splice(index, 1, ...outlineNode.children);
			outlineNode.children.forEach(
				(child) => (child.parent = outlineNode.parent)
			);
			this.map.delete(id);
		}

		this.updateHeading();
		return !!outlineNode;
	}

	updateHeading() {
		for (const [key, outlineNode] of this.map) outlineNode.node?.updateSymbol();
	}

	dataLevel(id: string) {
		let current = this.findNodeById(id),
			offset = -2;
		while (current) {
			offset++;
			current = current.parent;
		}
		return offset;
	}

	private renderOrder1(id: string) {
		const nums = [];
		let current = this.findNodeById(id);

		while (current && current.parent) {
			const index = current.parent.children.indexOf(current) + 1;

			nums.unshift(index);
			current = current.parent;
		}

		return nums.join('.');
	}
	private renderOrder2(id: string) {
		let current = this.findNodeById(id);
		const index = current?.parent?.children.indexOf(current);
		if (typeof index !== 'number') return '';
		const offset = this.dataLevel(id);
		switch (offset % 3) {
			case 0:
				return convertToChineseNumber(index + 1);
			case 1:
				return `(${convertToChineseNumber(index + 1)})`;
			case 2:
				return index + 1 + '';
		}

		return '';
	}
	private renderOrder3(id: string) {
		let current = this.findNodeById(id);
		const index = current?.parent?.children.indexOf(current);
		if (typeof index !== 'number') return '';
		const offset = this.dataLevel(id);
		switch (offset % 3) {
			case 0:
				return convertToAlphabet(index + 1);
			case 1:
				return convertToRoman(index + 1);
			case 2:
				return index + 1 + '';
		}

		return '';
	}
	calculateOrderNumber(id: string) {
		switch (this.orderType) {
			case 1:
				return this.renderOrder1(id);
			case 2:
				return this.renderOrder2(id);
			case 3:
				return this.renderOrder3(id);
		}
		return '';
	}
}

export const outlineTreeKey = new PluginKey<OutlineTree>('outlineTreeKey');
export const outlineTreePlugin = new Plugin({
	key: outlineTreeKey,
	state: {
		init(_, { doc }) {
			const outlineTree = new OutlineTree();
			return outlineTree;
		},
		apply(tr, value, oldState) {
			tr.steps.forEach((step) => {
				if (step instanceof ReplaceStep) {
					const { from, to } = step;
					if (Math.max(from, to) >= oldState.doc.nodeSize) return;
					oldState.doc.nodesBetween(from, to, (node, pos) => {
						if (node.type.name === 'heading' && pos >= from) {
							value.removeById(node.attrs.blockId);
						}
					});
				}
			});

			return value;
		}
	},
	appendTransaction(transactions, oldState, newState) {
		let tr: Transaction | undefined;
		for (const transaction of transactions) {
			const data = transaction.getMeta('toggleHeading');

			if (data && typeof data.pos !== 'undefined') {
				tr = newState.tr;
				const pos = data.pos;
				const $pos = oldState.doc.resolve(pos);
				const parent = $pos.parent;
				const index = $pos.index($pos.depth);
				const node = parent.child(index);
				let offset = pos + node.nodeSize;

				for (let i = index + 1; i < parent.childCount; i++) {
					const current = parent.child(i);

					if (
						current.type.name === 'heading' &&
						current.attrs.level <= node.attrs.level
					)
						break;

					tr = tr.setNodeMarkup(
						offset,
						current.type,
						{
							...current.attrs,
							hidden: data.hidden
						},
						current.marks
					);
					offset += current.nodeSize;
				}
				tr = tr.setSelection(
					TextSelection.create(tr.doc, pos + node.nodeSize - 1)
				);
				break;
			}
		}
		return tr;
	}
});
