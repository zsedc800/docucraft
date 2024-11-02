import { Node, NodeType } from 'prosemirror-model';
import { Command, TextSelection } from 'prosemirror-state';

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
		tr = tr.insert(pos, nodeType.create(attrs));
		tr = tr.setSelection(TextSelection.create(tr.doc, pos + 1));
		tr = tr.scrollIntoView();
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
