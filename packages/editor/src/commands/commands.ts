import { Node, NodeRange, NodeType } from 'prosemirror-model';
import { Command, NodeSelection, TextSelection } from 'prosemirror-state';
import { canJoin, findWrapping } from 'prosemirror-transform';

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

export const insert =
	(pos: number, nodeType: NodeType, attrs: any): Command =>
	(state, dispatch) => {
		let tr = state.tr;
		tr = tr
			.insert(pos, nodeType.create(attrs))
			.setSelection(TextSelection.create(tr.doc, pos + 1))
			.scrollIntoView();
		if (dispatch) {
			dispatch(tr);
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
	(nodeType: NodeType, attrs?: any): Command =>
	(state, dispatch) => {
		let { tr } = state;
		const { selection } = tr;

		if (selection instanceof NodeSelection && dispatch) {
			const { from, to, $from, $to } = selection;
			let start = Math.min(from, to);
			if (nodeType.isTextblock) tr = tr.setBlockType(from, to, nodeType, attrs);
			else if (nodeType.isInline) {
				const { parent: node, pos } = tr.doc.resolve(start + 1);
				if (!node.isAtom) {
					const n = nodeType.create(attrs);
					tr = tr.insert(pos, n);
					start++;
				}
			} else {
				const range = new NodeRange($from, $to, $from.depth);
				const wrapping = findWrapping(range, nodeType);
				if (!wrapping) return false;
				tr.wrap(range, wrapping);
				const before = tr.doc.resolve(start).nodeBefore;
				if (before && before.type === nodeType && canJoin(tr.doc, start))
					tr.join(start);
			}

			const sel = TextSelection.create(tr.doc, start + 1);
			console.log(sel, 'sel');

			dispatch(tr.setSelection(sel));
			return true;
		}
		return false;
	};
