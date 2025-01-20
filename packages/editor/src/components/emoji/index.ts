import { NodeSpec } from 'prosemirror-model';

export const emojiNodeSpec: NodeSpec = {
	inline: true,
	attrs: {
		code: { default: '' }
	},
	group: 'inline',
	parseDOM: [
		{
			tag: '[data-emoji]',
			getAttrs: (dom) => ({ code: dom.textContent })
		}
	],
	toDOM(node) {
		return ['i', { 'data-emoji': true }, node.attrs.code];
	},
	leafText(node) {
		return node.attrs.code;
	}
};
