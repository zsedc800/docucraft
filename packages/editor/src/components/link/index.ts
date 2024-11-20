import { NodeSpec } from 'prosemirror-model';

export * from './view';

export const LinkSpec: NodeSpec = {
	inline: true,
	group: 'inline',
	selectable: true,
	attrs: {
		href: { default: '' },
		// download: { default: null },
		title: { default: '' },
		target: { default: '_blank' }
	},
	content: 'inline*',
	parseDOM: [
		{
			tag: 'a[href]:not([href *= "javascript:" i])',
			getAttrs(node) {
				return {
					href: node.getAttribute('href'),
					// download: node.getAttribute('download') || null,
					title: node.getAttribute('title') || null,
					target: node.getAttribute('target')
				};
			}
		}
	]
	// toDOM(node) {
	// 	return ['a', { ...node.attrs }, 0];
	// }
};
