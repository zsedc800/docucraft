import { NodeType } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';
import { schema } from '../../model';
import './style.scss';

export * from './view';

function getTextByNodeType(type: NodeType) {
	if (type === schema.nodes.list_item) {
		return '项目';
	} else if (type === schema.nodes.taskItem) {
		return '代办事项';
	} else if (type === schema.nodes.timelineContent) {
		return '输入 / 唤起命令';
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
