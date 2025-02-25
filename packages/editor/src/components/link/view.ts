import { BaseNodeView } from '../../utils/view';
import Link from './Link';
import { NodeViewParameters } from '../../interface';

export class LinkView extends BaseNodeView {
	constructor(...[node, view, getPos]: NodeViewParameters) {
		super(node, view, getPos);
		this.component = Link;
		this.render();
	}
}

export const LinkViewConstructor = (...args: NodeViewParameters) =>
	new LinkView(...args);
