import { NodeSpec } from 'prosemirror-model';

export const mathInlineNodeSpec: NodeSpec = {
	group: 'inline',
	inline: true,
	atom: true,
	toDOM: (node) => ['span', { class: 'math-inline-node' }, node.attrs.formula],
	parseDOM: [
		{
			tag: 'span.math-inline-node',
			getAttrs: (dom) => ({ formula: dom.textContent })
		}
	],
	attrs: {
		formula: { default: '' }
	}
};

export const mathBlockNodeSpec: NodeSpec = {
	group: 'block',
	atom: true,
	toDOM(node) {
		return ['div', { class: 'math-block-node' }, node.attrs.formula];
	},
	parseDOM: [
		{
			tag: 'div.math-block-node',
			getAttrs: (dom) => ({ formula: dom.textContent })
		}
	],
	attrs: { formula: { default: '' } }
};
