import { NodeType } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';
import './style.scss';

export * from './view';

// export const textblockPlugin = new Plugin({
// 	appendTransaction(transactions, oldState, newState) {
// 		const { doc, selection, tr } = newState;
// 		const curPos = selection.from;

// 		let apply = false;
// 		doc.descendants((node, pos) => {
// 			if (node.type === schema.nodes.paragraph) {
// 				const isCursorInside = curPos >= pos && curPos < pos + node.nodeSize;
// 				if (isCursorInside) {
// 					const $pos = doc.resolve(pos);
// 					const parentNode = $pos.parent;
// 					const placeholder = getTextByNodeType(parentNode.type);
// 					tr.setNodeAttribute(pos, 'placeholder', placeholder);
// 					apply = true;
// 				} else if (node.attrs.placeholder) {
// 					tr.setNodeAttribute(pos, 'placeholder', '');
// 					apply = true;
// 				}
// 			}
// 		});

// 		return apply ? tr : null;
// 	}
// });
