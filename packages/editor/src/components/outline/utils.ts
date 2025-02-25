import { Node } from 'prosemirror-model';
import { OutlineNode } from '.';

export function nodesBetween(
	parent: Node,
	from: number,
	to: number,
	fn: (e: Node, i: number) => boolean | void,
	after = true
) {
	let level = Infinity;
	for (let i = from; i <= to; i++) {
		const node = parent.child(i);
		const {
			type,
			attrs: { level: l }
		} = node;

		if (type.name !== 'heading' || l === 1 || l > level) continue;

		if (fn(node, i) === false) break;

		if (l < level) level = l;
	}

	if (after) return;

	for (let i = from; i >= to; i--) {
		const node = parent.child(i);
		const {
			type,
			attrs: { level: l }
		} = node;

		if (type.name !== 'heading' || l === 1 || l > level) continue;

		if (fn(node, i) === false) break;
	}
}

export function findOffsetInParent(parent: Node, start: number, end: number) {
	let count = 0;
	nodesBetween(parent, start, end, () => {
		count++;
	});
	return count;
}

export function addChild(
	node: OutlineNode,
	child: OutlineNode,
	offset: number = -1
) {
	const children = child.parent?.children || [];
	if (offset > -1) node.children.splice(offset, 0, child);
	else node.children.push(child);
	const index = children.indexOf(child);
	if (index > -1) children.splice(index, 1);
	child.parent = node;
}
