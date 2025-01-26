import { NodeSpec } from 'prosemirror-model';

export const iconNodeSpec: NodeSpec = {
	inline: true,
	attrs: {
		code: { default: '' }
	},
	group: 'inline',
	parseDOM: [
		{
			tag: 'i.dUI-icons',
			getAttrs: (dom) => ({ code: dom.textContent })
		}
	],
	toDOM(node) {
		return ['i', { class: 'dUI-icons' }, node.attrs.code];
	},
	leafText(node) {
		return node.attrs.code;
	}
};
