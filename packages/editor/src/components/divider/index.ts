import { NodeViewConstructor } from 'prosemirror-view';
import DividerView from './view';

export { default as DividerView } from './view';

export const DividerViewConstructor: NodeViewConstructor = (...args) =>
	new DividerView(...args);

export { DividerSpec } from './schema';
