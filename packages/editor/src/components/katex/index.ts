import katex from 'katex';
import { NodeSpec } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';
import createElement from '../../createElement';
import { EditorView } from 'prosemirror-view';

export const mathNodeSpec: NodeSpec = {
	group: 'inline',
	inline: true,
	atom: true,
	toDOM: (node) => ['span', { class: 'math-node' }, node.attrs.formula],
	parseDOM: [
		{ tag: 'span.math-node', getAttrs: (dom) => ({ formula: dom.textContent }) }
	],
	attrs: {
		formula: {}
	}
};

const renderMath = (formula: string) => {
	const span = createElement('span', { class: 'math-node' });
	katex.render(formula, span);
	return span;
};

export const mathRender = () => {
	return new Plugin({
		props: {
			nodeViews: {
				math(node, view, getPos) {
					const dom = renderMath(node.attrs.formula);
					return {
						dom,
						update: (newNode) => {
							if (
								newNode.type.name === 'math' &&
								newNode.attrs.formula === node.attrs.formula
							)
								return true;
							return false;
						}
					};
				}
			}
		}
	});
};

export const insertMath = (view: EditorView, formula: string) => {
	const { state, dispatch } = view;
	const node = state.schema.nodes.math.create({ formula });
	dispatch(state.tr.replaceSelectionWith(node));
};
