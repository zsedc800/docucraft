import { NodeViewConstructor, ViewMutationRecord } from 'prosemirror-view';
import { Node } from 'prosemirror-model';
import { BaseNodeView } from '../../utils/view';
import { shallowEqual } from '../../utils';
import Paragraph from './Paragraph';

export class ParagraphView extends BaseNodeView {
	placeholder: string = ' ';
	constructor(...args: Parameters<NodeViewConstructor>) {
		const [node, view, getPos] = args;
		super(node, view, getPos);
		this.component = Paragraph;
		this.render({ text: node.textContent });
	}

	update(node: Node) {
		const { type, attrs, textContent: txt } = node;
		const { attrs: props, type: t, textContent: text } = this.node;
		if (type !== t) return false;
		this.node = node;

		if (!shallowEqual(attrs, props) || txt !== text) this.render({ text: txt });
		return true;
	}

	ignoreMutation(mutation: ViewMutationRecord): boolean {
		if (super.ignoreMutation(mutation)) return true;
		return mutation.type === 'attributes';
	}
}

export const ParagraphViewConstructor: NodeViewConstructor = (...args) =>
	new ParagraphView(...args);
