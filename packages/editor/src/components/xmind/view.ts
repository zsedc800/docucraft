import { ViewMutationRecord } from 'prosemirror-view';
import { NodeViewConstructor, NodeViewParameters } from '../../interface';
import { BaseNodeView } from '../../utils/view';
import Mind from './Mind';

export class XMindView extends BaseNodeView {
	constructor(...[node, view, getPos]: NodeViewParameters) {
		super(node, view, getPos);
		this.component = Mind;
		this.render();
	}
	// ignoreMutation(mutation: ViewMutationRecord): boolean {
	// 	return true;
	// }
	stopEvent(e: Event) {
		if (e.type.includes('drag')) {
			e.preventDefault();
			return true;
		}
		return false;
	}
}

export const XMindViewConstructor: NodeViewConstructor = (...args) =>
	new XMindView(...args);
