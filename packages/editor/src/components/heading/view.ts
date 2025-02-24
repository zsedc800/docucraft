import { NodeViewConstructor } from 'prosemirror-view';
import { Node } from 'prosemirror-model';
import { assignUniqueId, shallowEqual } from '../../utils';
import { OutlineTree, outlineTreeKey } from '../outline';
import Heading from './Heading';
import { BaseNodeView } from '../../utils/view';
const headingViewMap = new Map<string, HeadingView>();
export class HeadingView extends BaseNodeView {
	id: string;
	outlineTree?: OutlineTree;
	constructor(...args: Parameters<NodeViewConstructor>) {
		const [node, view, getPos] = args;
		super(node, view, getPos);
		this.node = node;
		// assignUniqueId(this.node);
		// const { id } = node.attrs;
		this.id = this.blockId;
		this.component = Heading;
		const outlineTree = outlineTreeKey.getState(view.state);
		const pos = getPos();
		headingViewMap.set(this.blockId, this);
		if (node.attrs.level === 1) {
			this.render();
		} else if (outlineTree && typeof pos !== 'undefined') {
			outlineTree.insertOrUpdate(this, view.state.doc.resolve(pos));
			this.outlineTree = outlineTree;
			for (const [key, nodeview] of headingViewMap) nodeview.updateSymbol();
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

export const HeadingViewConstructor: NodeViewConstructor = (...args) =>
	new HeadingView(...args);
