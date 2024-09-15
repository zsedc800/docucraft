import { Node, ResolvedPos } from 'prosemirror-model';
import { EditorState, Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet, DecorationSource } from 'prosemirror-view';
import createElement from '../../createElement';
import { ReplaceStep } from 'prosemirror-transform';
import { HeadingView } from '../heading';

export class OutlineNode {
	children: OutlineNode[];
	parent: OutlineNode | null;
	constructor(
		public node: HeadingView | null,
		public level: number
	) {
		this.children = [];
		this.parent = null;
	}
}

export class OutlineTree {
	root: OutlineNode;
	constructor(public decorations: DecorationSource) {
		this.root = new OutlineNode(null, 0);
	}
	foldOrNot(fold: boolean, dom: HTMLElement) {
		let current: Element | null = dom;
		const level = Number(dom.tagName.charAt(1));
		while ((current = current.nextElementSibling)) {
			if (
				/^h\d$/.test(current.tagName) &&
				Number(dom.tagName.charAt(1)) <= level
			)
				break;
			else
				fold
					? current.classList.add('hidden')
					: current.classList.remove('hidden');
		}
	}
	insertOrUpdate(heading: HeadingView, $pos: ResolvedPos) {
		const node = heading.node;
		const level = node.attrs.level;

		const parent = $pos.parent;
		const outlineNode = new OutlineNode(heading, level);
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
			outlineNode.children.push(olNode);
			const index = olNode.parent!.children.indexOf(olNode);
			olNode.parent?.children.splice(index, 1);
		}

		for (const child of outlineNode.children) child.parent = outlineNode;

		lastLevel = Infinity;
		for (let i = index - 1; i >= 0; i--) {
			cursor = parent.child(i);
			if (cursor.type.name !== 'heading') continue;

			const olNode = this.findNodeById(cursor.attrs.id);
			if (!olNode) throw new Error('can not found node');
			console.log(olNode, 'olnode');

			if (olNode.level > level) {
				let l = olNode.level;
				if (l < lastLevel) {
					count = 1;
					lastLevel = l;
				} else if (l > lastLevel) {
				} else {
					count++;
				}
			} else if (olNode.level < level) {
				olNode.children.unshift(outlineNode);
				outlineNode.parent = olNode;
				count = -1;
				break;
			} else {
				const index = olNode.parent!.children.indexOf(olNode);
				if (index !== -1)
					olNode.parent?.children.splice(index + 1, 0, outlineNode);
				count = -1;
				outlineNode.parent = olNode.parent;
				break;
			}
		}

		if (count >= 0) {
			this.root.children.splice(count, 0, outlineNode);
			outlineNode.parent = this.root;
		}

		return outlineNode;
	}

	findNodeById(id: string) {
		const search = (currentNode: OutlineNode): OutlineNode | null => {
			if (currentNode.node?.id === id) return currentNode;
			for (let child of currentNode.children) {
				const result = search(child);
				if (result) return result;
			}
			return null;
		};
		return search(this.root);
	}

	removeById(id: string) {
		const searchAndRemove = (currentNode: OutlineNode) => {
			const index = currentNode.children.findIndex(
				(child) => child.node?.id === id
			);
			if (index !== -1) {
				currentNode.children.splice(index, 1);
				return true;
			}
			for (const child of currentNode.children) {
				if (searchAndRemove(child)) return true;
			}
			return false;
		};
		const res = searchAndRemove(this.root);
		let queue = [this.root];
		while (queue.length) {
			const ele = queue.shift();
			ele?.node?.updateSymbol();
			queue = queue.concat(ele!.children);
		}
		return res;
	}
	calculateOrderNumber(node: Node) {
		const nums = [];
		let current = this.findNodeById(node.attrs.id);

		console.log(current, 'cur');
		while (current && current.parent) {
			const index = current.parent.children.indexOf(current) + 1;

			nums.unshift(index);
			current = current.parent;
		}

		return nums.join('.');
	}
}

export const outlineTreeKey = new PluginKey<OutlineTree>('outlineTreeKey');
export const outlineTreePlugin = new Plugin({
	key: outlineTreeKey,
	state: {
		init(_, { doc }) {
			const outlineTree = new OutlineTree(
				DecorationSet.create(doc, getDecos(doc))
			);
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
			// value.decorations = DecorationSet.create(tr.doc, getDecos(tr.doc, value));
			// const mappedDecorationSet = value.decorations.map(tr.mapping, tr.doc);
			// const decorations: Decoration[] = [];
			// tr.steps.forEach((step) => {
			// 	if (step instanceof ReplaceStep && step.slice && step.slice.content) {
			// 		step.slice.content.forEach((node) => {
			// 			console.log(node, step, 'step');

			// 			if (node.type.name === 'heading') {
			// 				decorations.push(
			// 					Decoration.widget(
			// 						step.from + 1,
			// 						() =>
			// 							createElement(
			// 								'span',
			// 								{ class: 'list-symbol' },
			// 								value.calculateOrderNumber(node)
			// 							),
			// 						{ key: node.attrs.id }
			// 					)
			// 				);
			// 			}
			// 		});
			// 	}
			// });

			return value;
		}
	}
	// props: {
	// 	decorations(state) {
	// 		return outlineTreeKey.getState(state)?.decorations;
	// 	}
	// }
});

function getDecos(doc: Node, tree?: OutlineTree): Decoration[] {
	if (!tree) return [];

	let decorations: Decoration[] = [];

	doc.descendants((node, pos) => {
		if (node.type.name === 'heading') {
			decorations.push(
				Decoration.widget(
					pos + 1,
					() =>
						createElement(
							'span',
							{ class: 'list-symbol' },
							tree.calculateOrderNumber(node)
						),
					{
						ignoreSelection: true
					}
				)
			);
		}
	});

	return decorations;
}
