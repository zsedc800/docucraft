import { NodeSpec } from 'prosemirror-model';

export const blockQuote: NodeSpec = {
	content: 'paragraph+',
	group: 'block',
	toDOM() {
		return ['blockquote', 0];
	},
	parseDOM: [
		{
			tag: 'blockquote'
		}
	]
};
