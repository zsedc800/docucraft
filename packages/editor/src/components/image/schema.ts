import { NodeSpec } from 'prosemirror-model';

export const imageNodeSpec: NodeSpec = {
	inline: false,
	attrs: {
		src: { default: null },
		alt: { default: null },
		title: { default: null },
		link: { default: null },
		width: { default: null },
		align: { default: 'left' }
	},
	group: 'block',
	draggable: false,
	parseDOM: [
		{
			tag: 'img[src]',
			getAttrs: (dom) => ({
				src: dom.getAttribute('src'),
				title: dom.getAttribute('title'),
				alt: dom.getAttribute('alt')
			})
		}
	],
	toDOM: (node) => {
		const { title, src, alt } = node.attrs;

		return ['img', { title, src, alt }];
	}
};
