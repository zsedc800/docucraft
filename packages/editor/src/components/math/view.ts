import { NodeViewConstructor } from 'prosemirror-view';
import { BaseNodeView } from '../../utils/view';
import { MathBlockNode, MathInlineNode } from './Math';
import { Node } from 'prosemirror-model';

export class MathInlineNodeView extends BaseNodeView {
	constructor(...[node, view, getPos]: Parameters<NodeViewConstructor>) {
		super(node, view, getPos);

		this.component = MathInlineNode;
		this.render();
	}
	update(node: Node): boolean {
		console.log(node, this.node, 'nn update');

		return super.update(node);
	}
}

export class MathBlockNodeView extends BaseNodeView {
	constructor(...[node, view, getPos]: Parameters<NodeViewConstructor>) {
		super(node, view, getPos);
		this.component = MathBlockNode;
		this.render();
	}
}

export function createMathNodeView(): Record<
	'mathInline' | 'mathBlock',
	NodeViewConstructor
> {
	return {
		mathBlock: (...args) => new MathBlockNodeView(...args),
		mathInline: (...args) => new MathInlineNodeView(...args)
	};
}
