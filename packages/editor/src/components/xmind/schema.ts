import { NodeSpec } from 'prosemirror-model';

export const xmindNodeSpec: NodeSpec = {
	attrs: {},
	atom: true,
	group: 'block',
	isolating: true,
	defining: true,
	selectable: true,
	toDOM(node) {
		return ['div', { class: 'Mindmap' }];
	},
	parseDOM: [
		{
			tag: 'div.Mindmap'
		}
	]
};
