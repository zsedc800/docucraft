import {
	Decoration,
	DecorationSet,
	NodeViewConstructor
} from 'prosemirror-view';
import { BaseNodeView } from '../../utils/view';
import Paragraph from './Paragraph';
import { Node } from 'prosemirror-model';
import './style.scss';
import { Plugin } from 'prosemirror-state';
import { schema } from '../../model';

export class ParagraphView extends BaseNodeView {
	constructor(...args: Parameters<NodeViewConstructor>) {
		const [node, view, getPos] = args;
		super(node, view, getPos);
		this.component = Paragraph;
		this.render();
		this.hack();
	}

	clearBr = () => {
		if (this.contentDOM) this.contentDOM.innerHTML = '';
	};

	hack() {
		if (requestAnimationFrame) requestAnimationFrame(this.clearBr);
		else setTimeout(this.clearBr, 17);
	}

	ignoreMutation(mutation: MutationRecord): boolean {
		if (mutation.type === 'childList') {
			const node = mutation.removedNodes && mutation.removedNodes[0];
			if (
				node &&
				'className' in node &&
				node.className === 'ProseMirror-trailingBreak'
			)
				return true;
		}
		return super.ignoreMutation(mutation);
	}

	update(node: Node) {
		if (!node.content.size) this.hack();
		const { type, attrs } = node;
		const { attrs: props, type: t } = this.node;
		if (type !== t) return false;
		this.node = node;
		this.render({ text: node.textContent });
		return true;
	}
}

export const ParagraphViewConstructor: NodeViewConstructor = (...args) =>
	new ParagraphView(...args);

export const textblockPlugin = new Plugin({
	appendTransaction(transactions, oldState, newState) {
		const { doc, selection, tr } = newState;
		const curPos = selection.from;

		doc.descendants((node, pos) => {
			if (node.type === schema.nodes.paragraph) {
				const isCursorInside = curPos >= pos && curPos < pos + node.nodeSize;

				if (isCursorInside) {
					tr.setNodeAttribute(pos, 'placeholder', '输入 / 唤起命令');
				} else {
					tr.setNodeAttribute(pos, 'placeholder', ' ');
				}
			}
		});

		return tr;
	}
});
