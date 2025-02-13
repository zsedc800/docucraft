import { NodeSpec } from 'prosemirror-model';

export const DividerSpec: NodeSpec = {
	group: 'block',
	parseDOM: [{ tag: 'hr' }],
	toDOM: () => ['hr']
};
