import { NodeViewConstructor } from 'prosemirror-view';
import DividerView from './view';
import { NodeSpec } from 'prosemirror-model';

export { default as DividerView } from './view';

export const DividerViewConstructor: NodeViewConstructor = (...args) =>
	new DividerView(...args);

export const DividerSpec: NodeSpec = {
	group: 'block',
	parseDOM: [{ tag: 'hr' }],
	toDOM: () => ['hr']
};
