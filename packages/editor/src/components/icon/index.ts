import { NodeSpec } from 'prosemirror-model';

export const iconNodeSpec: NodeSpec = {
	inline: true,
	attrs: {
		code: { default: '' },
		color: { default: '' }
	},
	group: 'inline',
	parseDOM: [
		{
			tag: 'i.dUI-icons',
			getAttrs: (dom) => ({
				code: dom.textContent,
				color: dom.style.color || ''
			})
		}
	],
	toDOM(node) {
		const dom = document.createElement('i');
		dom.classList.add('dUI-icons');
		dom.style.color = node.attrs.color;
		dom.innerHTML = node.attrs.code;
		return dom;
	},
	leafText(node) {
		return node.attrs.code;
	}
};
