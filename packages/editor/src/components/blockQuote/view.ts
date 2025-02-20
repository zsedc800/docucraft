import { NodeViewConstructor } from 'prosemirror-view';
import { BaseNodeView } from '../../utils/view';
import BlockQuote from './BlockQuote';

export class BlockQuoteView extends BaseNodeView {
	constructor(...[node, view, getPos]: Parameters<NodeViewConstructor>) {
		super(node, view, getPos);
		this.component = BlockQuote;
		this.render();
		this.contentDOM = this.dom;
	}
}

export const BlockQuoteViewConstructor: NodeViewConstructor = (...args) =>
	new BlockQuoteView(...args);
