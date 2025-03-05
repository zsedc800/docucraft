import { NodeSpec } from 'prosemirror-model';

export const xmindNodeSpec: NodeSpec = {
	attrs: {},
	atom: true,
	group: 'block',
	isolating: true,
	defining: true,
	toDOM(node) {
		return ['div', { class: 'xmind' }];
	},
	parseDOM: [
		{
			tag: 'div.xmind'
		}
	]
};
