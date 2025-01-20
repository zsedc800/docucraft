import { NodeSpec } from 'prosemirror-model';

export const iconNodeSpec: NodeSpec = {
	inline: true,
	attrs: {
		code: { default: '' }
	},
	group: 'inline',
	parseDOM: [
		{
			tag: 'i.docIcon',
			getAttrs: (dom) => ({ code: dom.textContent })
		}
	],
	toDOM(node) {
		return ['i', { class: 'docIcon' }, node.attrs.code];
	}
};
