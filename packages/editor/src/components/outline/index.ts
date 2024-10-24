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
	constructor(public decorations: DecorationSource) {
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
		let cursor,
			count = 0,
			lastLevel = Infinity;
		for (let i = index + 1; i < parent.childCount; i++) {
			cursor = parent.child(i);
			if (cursor.type.name !== 'heading' || cursor.attrs.level > lastLevel)
				continue;

			const olNode = this.findNodeById(cursor.attrs.id);

			if (!olNode) throw new Error('can not found node');
			const l = olNode.level;
			if (l <= level) break;

			if (l < lastLevel) lastLevel = l;
			let p = olNode;
			while (p.parent && !p.parent.node && p.level > level) p = p.parent;

			const index = p.parent!.children.indexOf(p);
			const cc = p.parent!.children;
			console.log(cc, p, index, 'i');

			if (p.level > level) {
				outlineNode.children.push(p);
				cc.splice(index, 1);
			} else if (p.level === level) {
				outlineNode.children = p.children;
				cc[index] = outlineNode;
				outlineNode.parent = p.parent;
			} else {
				const [child] = p.children;
				if (child && child.node) {
					outlineNode.children.push(child);
					p.children[0] = outlineNode;
					outlineNode.parent = p;
				} else if (child && !child.node) {
					p.children[0] = outlineNode;
					outlineNode.parent = p;
					outlineNode.children = child.children;
				}
			}
		}

		for (const child of outlineNode.children) child.parent = outlineNode;

		lastLevel = Infinity;
		count = -1;

		const findOffset = (start: number, end: number) => {
			const cursor = parent.child(start);
			let level = cursor.attrs.level,
				count = 1;
			for (let i = start + 1; i <= end; i++) {
				const ele = parent.child(i);
				if (ele.type.name !== 'heading') continue;
				const l = ele.attrs.level;
				if (l > level) continue;
				else if (l === level) count++;
				else {
					level = l;
					count++;
				}
			}
			return count;
		};
		for (let i = index - 1; i >= 0; i--) {
			cursor = parent.child(i);
			if (cursor.type.name !== 'heading') continue;

			const olNode = this.findNodeById(cursor.attrs.id);
			if (!olNode) throw new Error('can not found node');

			if (olNode.level < level) {
				const offset = findOffset(i + 1, index - 1);
				olNode.children.splice(offset, 0, outlineNode);
				outlineNode.parent = olNode;
				break;
			} else if (olNode.level === level) {
				const index = olNode.parent!.children.indexOf(olNode);
				if (index !== -1)
					olNode.parent?.children.splice(index + 1, 0, outlineNode);
				outlineNode.parent = olNode.parent;
				break;
			}
		}

		if (!outlineNode.parent) {
			this.root.children.splice(findOffset(0, index - 1), 0, outlineNode);
			outlineNode.parent = this.root;
		}
		//
		index = outlineNode.parent!.children.indexOf(outlineNode);
		const children = outlineNode.parent!.children;

		for (let i = index - 1; i >= 0; i--) {
			const node = children[i];
			if (node.level > outlineNode.level) {
				let l = node.level;
				let newNode = node;
				while (l > level) {
					l--;
					const t = new OutlineNode(generateUniqueId(), null, l);
					t.children.push(newNode);
					newNode.parent = t;
					newNode = t;
				}
				children[i] = newNode;
				newNode.parent = outlineNode.parent;
			}
		}

		console.log(outlineNode, 'nn');

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
			const outlineTree = new OutlineTree(DecorationSet.create(doc, []));
			return outlineTree;
		},
		apply(tr, value, oldState) {
			tr.steps.forEach((step) => {
				if (step instanceof ReplaceStep) {
					const { from, to } = step;

					oldState.doc.nodesBetween(from, to, (node, pos) => {
						if (node.type.name === 'heading' && pos >= from) {
							value.removeById(node.attrs.id);
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
