import { EditorView } from 'prosemirror-view';
import { createNode } from '../../commands';

export { mathBlockNodeSpec, mathInlineNodeSpec } from './schema';

export { createMathNodeView } from './view';

export const insertMath = (view: EditorView, formula: string) => {
	const { state, dispatch } = view;
	const node = createNode(state.schema.nodes.math, { formula });
	dispatch(state.tr.replaceSelectionWith(node));
};
