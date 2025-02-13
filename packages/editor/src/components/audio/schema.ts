import { NodeSpec } from 'prosemirror-model';

export const audioNodeSpec: NodeSpec = {
	group: 'block',
	atom: true,
	attrs: {
		src: { default: '' }
	},
	parseDOM: [
		{
			tag: 'audio',
			getAttrs(dom) {
				return {
					src: dom.getAttribute('src')
				};
			}
		}
	],
	toDOM(node) {
		const { src } = node.attrs;
		return ['audio', { src }];
	}
};
