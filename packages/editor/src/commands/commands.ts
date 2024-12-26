import {
	Attrs,
	Fragment,
	Mark,
	Node,
	NodeRange,
	NodeType
} from 'prosemirror-model';
import { Command, NodeSelection, TextSelection } from 'prosemirror-state';
import { canJoin, findWrapping } from 'prosemirror-transform';
import { generateUniqueId } from '../utils';

export const insertCodeBlock: Command = (state, dispatch, view) => {
	const lastLanguage = state.schema.cached.lastLanguage || 'plaintext';
	const { codeBlock } = state.schema.nodes;
	const codeBlockNode = codeBlock.create({ language: lastLanguage });
	let tr = state.tr;
	tr.replaceSelectionWith(codeBlockNode);
	tr.scrollIntoView();

	if (dispatch) {
		dispatch(tr);
		return true;
	}

	return false;
};

function addBlockId(attrs?: Attrs | null) {
	return { ...attrs, blockId: generateUniqueId() };
}

export function createNode(
	type: NodeType,
	attrs?: any | null,
	content?: Node | Fragment | readonly Node[] | null,
	marks?: Mark[]
) {
	return type.create(addBlockId(attrs), content, marks);
}

export function createNodeAndFill(
	type: NodeType,
	attrs?: any | null,
	content?: Node | Fragment | readonly Node[] | null,
	marks?: Mark[]
) {
	return type.createAndFill(addBlockId(attrs), content, marks);
}

export function createNodeChecked(
	type: NodeType,
	attrs?: any | null,
	content?: Node | Fragment | readonly Node[] | null,
	marks?: Mark[]
) {
	return type.createChecked(attrs, content, marks);
}

export const insert =
	(
		pos: number,
		nodeType: NodeType,
		attrs?: any,
		content?: Node | Fragment | readonly Node[] | null
	): Command =>
	(state, dispatch) => {
		let tr = state.tr.insert(pos, createNode(nodeType, attrs, content));

		if (dispatch) {
			dispatch(
				tr.setSelection(TextSelection.create(tr.doc, pos + 1)).scrollIntoView()
			);
			return true;
		}
		return false;
	};

export const insertAfter =
	(node: Node, nodeType: NodeType): Command =>
	(state, dispatch, view) => {
		return false;
	};

export const transformToNode =
	(
		nodeType: NodeType,
		attrs?: any,
		content?: Node | Fragment | readonly Node[]
	): Command =>
	(state, dispatch) => {
		let { tr } = state;
		const { selection } = tr;
		console.log(nodeType, 'nodetype');

		if (selection instanceof NodeSelection && dispatch) {
			const { from, to, $from, $to } = selection;
			let start = Math.min(from, to);
			if (nodeType.isTextblock) tr = tr.setBlockType(from, to, nodeType, attrs);
			else if (nodeType.isInline) {
				const { parent: node, pos } = tr.doc.resolve(start + 1);
				if (!node.isAtom) {
					const n = createNode(nodeType, attrs, content);
					tr = tr.insert(pos, n);
					start += n.nodeSize - 1;
				}
			} else if (nodeType.isAtom) {
				tr.insert(from, createNode(nodeType, attrs));
				tr.setSelection(TextSelection.create(tr.doc, from + 2));
				dispatch(tr);
				return true;
			} else {
				const range = new NodeRange($from, $to, $from.depth);
				const wrapping = findWrapping(range, nodeType);
				if (!wrapping) return false;

				let node = wrapping[wrapping.length - 1]?.type.isTextblock
					? void 0
					: createNode(state.schema.nodes.paragraph);
				for (const { type, attrs } of wrapping.reverse()) {
					node = createNode(type, attrs, node);
				}
				node && tr.replaceSelectionWith(node);
				// tr.wrap(range, wrapping);
				// const before = tr.doc.resolve(start).nodeBefore;
				// if (before && before.type === nodeType && canJoin(tr.doc, start))
				// 	tr.join(start);
			}

			const sel = TextSelection.create(tr.doc, start + 1);

			dispatch(tr.setSelection(sel));
			return true;
		}
		return false;
	};
