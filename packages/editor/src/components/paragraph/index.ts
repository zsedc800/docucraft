import { NodeViewConstructor } from 'prosemirror-view';
import { BaseNodeView } from '../../utils/view';
import Paragraph from './Paragraph';
import { Node, NodeType } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';
import { schema } from '../../model';
import { shallowEqual } from '../../utils';
import './style.scss';

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
}

export const ParagraphViewConstructor: NodeViewConstructor = (...args) =>
	new ParagraphView(...args);

function getTextByNodeType(type: NodeType) {
	if (type === schema.nodes.list_item) {
		return '项目';
	} else if (type === schema.nodes.taskItem) {
		return '代办事项';
	} else if (type && type !== schema.nodes.doc) {
		return '';
	}
	return '输入 / 唤起命令';
}

export const textblockPlugin = new Plugin({
	appendTransaction(transactions, oldState, newState) {
		const { doc, selection, tr } = newState;
		const curPos = selection.from;

		let apply = false;
		doc.descendants((node, pos) => {
			if (node.type === schema.nodes.paragraph) {
				const isCursorInside = curPos >= pos && curPos < pos + node.nodeSize;
				if (isCursorInside) {
					const $pos = doc.resolve(pos);
					const parentNode = $pos.parent;
					const placeholder = getTextByNodeType(parentNode.type);
					tr.setNodeAttribute(pos, 'placeholder', placeholder);
					apply = true;
				} else if (node.attrs.placeholder) {
					tr.setNodeAttribute(pos, 'placeholder', '');
					apply = true;
				}
			}
		});

		return apply ? tr : null;
	}
});
