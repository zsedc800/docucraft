import { NodeViewConstructor } from 'prosemirror-view';
import { Node } from 'prosemirror-model';
import { assignUniqueId } from '../../utils';
import { OutlineTree, outlineTreeKey } from '../outline';
import Heading from './Heading';
import { BaseNodeView } from '../../utils/view';
import './style.scss';

const headingViewMap = new Map<string, HeadingView>();

export class HeadingView extends BaseNodeView {
	contentDOM?: HTMLElement | null | undefined;
	node: Node;
	id: string;
	outlineTree?: OutlineTree;
	getPos: () => number | undefined;
	constructor(...args: Parameters<NodeViewConstructor>) {
		const [node, view, getPos] = args;
		super(node, view);
		this.node = node;
		this.getPos = getPos;
		assignUniqueId(this.node);
		const { id } = node.attrs;
		this.id = id;
		this.component = Heading;
		const outlineTree = outlineTreeKey.getState(view.state);
		const pos = getPos();
		headingViewMap.set(node.attrs.id, this);
		if (outlineTree && typeof pos !== 'undefined') {
			outlineTree.insertOrUpdate(this, view.state.doc.resolve(pos));
			this.outlineTree = outlineTree;
			for (const [key, nodeview] of headingViewMap) nodeview.updateSymbol();
		}
	}

	updateSymbol() {
		this.render({ view: this, ...this.node.attrs });
	}

	update(node: Node) {
		console.log('update');

		if (node.type !== this.node.type) return false;
		this.node = node;
		this.render({ view: this, ...node.attrs });
		return true;
	}
	destroy() {
		console.log('destroy');
	}
}

export const HeadingViewConstructor: NodeViewConstructor = (...args) =>
	new HeadingView(...args);
