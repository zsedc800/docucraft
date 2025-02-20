import { NodeSpec } from 'prosemirror-model';

export const emphasisSpec: NodeSpec = {
	content: 'block*',
	group: 'block',
	toDOM() {
		return ['div', { class: 'emphasis-block' }, 0];
	},
	parseDOM: [
		{
			tag: 'div.emphasis-block'
		}
	]
};
