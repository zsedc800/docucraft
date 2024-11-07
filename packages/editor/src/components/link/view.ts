import { NodeViewConstructor } from 'prosemirror-view';
import { BaseNodeView } from '../../utils/view';
import Link from './Link';

export class LinkView extends BaseNodeView {
	constructor(...[node, view, getPos]: Parameters<NodeViewConstructor>) {
		super(node, view, getPos);
		this.component = Link;
		this.render();
	}
	ignoreMutation(mutation: MutationRecord): boolean {
		console.log(mutation, 'mnm');

		return super.ignoreMutation(mutation);
	}
}

export const LinkViewConstructor: NodeViewConstructor = (...args) =>
	new LinkView(...args);
