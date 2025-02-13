import { Command } from 'prosemirror-state';
import { createNode } from '../../commands';

export { codeBlock } from './schema';

export const createCodeBlockCmd: Command = (state, dispatch, view) => {
	const lastLanguage = state.schema.cached.lastLanguage || 'plaintext';
	const { codeBlock } = state.schema.nodes;
	const codeBlockNode = createNode(codeBlock, { language: lastLanguage });
	let tr = state.tr;
	tr.replaceSelectionWith(codeBlockNode);
	tr.scrollIntoView();

	if (dispatch) {
		dispatch(tr);
		return true;
	}

	return false;
};
