import { NodeViewConstructor } from 'prosemirror-view';
import { BaseNodeView } from '../../utils/view';
import { MathBlockNode, MathInlineNode } from './Math';

export class MathInlineNodeView extends BaseNodeView {
	constructor(...[node, view, getPos]: Parameters<NodeViewConstructor>) {
		super(node, view, getPos);
		console.log(1111);

		this.component = MathInlineNode;
		this.render();
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
