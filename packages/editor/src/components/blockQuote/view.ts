import {
	Decoration,
	DecorationSource,
	NodeViewConstructor
} from 'prosemirror-view';
import { BaseNodeView } from '../../utils/view';
import BlockQuote from './BlockQuote';
import { Node } from 'prosemirror-model';
import { NodeViewParameters } from '../../interface';

export class BlockQuoteView extends BaseNodeView {
	constructor(...[node, view, getPos]: NodeViewParameters) {
		super(node, view, getPos);
		this.component = BlockQuote;
		this.render();
		this.contentDOM = this.dom;
	}
}

export const BlockQuoteViewConstructor = (...args: NodeViewParameters) =>
	new BlockQuoteView(...args);
