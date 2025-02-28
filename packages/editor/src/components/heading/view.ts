import { Node } from 'prosemirror-model';
import { shallowEqual } from '../../utils';
import { OutlineTree, outlineTreeKey } from '../outline';
import Heading from './Heading';
import { BaseNodeView } from '../../utils/view';
import { NodeViewParameters } from '../../interface';
export class HeadingView extends BaseNodeView {
	id: string;
	outlineTree?: OutlineTree;
	constructor(...args: NodeViewParameters) {
		const [node, view, getPos] = args;
		super(node, view, getPos);

		this.node = node;
		this.id = this.blockId;
		this.component = Heading;
		const outlineTree = outlineTreeKey.getState(view.state);
		const pos = getPos();
		if (node.attrs.level === 1) {
			this.render();
		} else if (outlineTree && typeof pos !== 'undefined') {
			outlineTree.insertOrUpdate(this, view.state.doc.resolve(pos));
			this.outlineTree = outlineTree;
			outlineTree.updateHeading();
		}
	}

	updateSymbol() {
		this.render();
	}

	update(node: Node) {
		const { type, attrs, textContent: txt } = node;
		const { attrs: props, type: t, textContent: text } = this.node;
		if (type !== t || attrs.level !== props.level) return false;
		this.node = node;
		if (!shallowEqual(props, attrs) || txt !== text) this.render();
		return true;
	}
}

export const HeadingViewConstructor = (...args: NodeViewParameters) =>
	new HeadingView(...args);
