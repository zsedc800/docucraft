import { NodeViewConstructor } from 'prosemirror-view';
import { BaseNodeView } from '../../utils/view';
import Emphasis from './Emphasis';

export class EmphasisView extends BaseNodeView {
	constructor(...[node, view, getPos]: Parameters<NodeViewConstructor>) {
		super(node, view, getPos);
		this.component = Emphasis;
		this.render();
	}
}

export const EmphasisViewConstructor: NodeViewConstructor = (...args) =>
	new EmphasisView(...args);
