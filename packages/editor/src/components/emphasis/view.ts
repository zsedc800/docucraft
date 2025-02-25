import { BaseNodeView } from '../../utils/view';
import Emphasis from './Emphasis';
import { NodeViewParameters } from '../../interface';

export class EmphasisView extends BaseNodeView {
	constructor(...[node, view, getPos]: NodeViewParameters) {
		super(node, view, getPos);
		this.component = Emphasis;
		this.render();
	}
}

export const EmphasisViewConstructor = (...args: NodeViewParameters) =>
	new EmphasisView(...args);
