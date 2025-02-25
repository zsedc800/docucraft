import { BaseNodeView } from '../../utils/view';
import { MathBlockNode, MathInlineNode } from './Math';
import { NodeViewConstructor, NodeViewParameters } from '../../interface';

export class MathInlineNodeView extends BaseNodeView {
	constructor(...[node, view, getPos]: NodeViewParameters) {
		super(node, view, getPos);
		this.component = MathInlineNode;
		this.render();
	}
}

export class MathBlockNodeView extends BaseNodeView {
	constructor(...[node, view, getPos]: NodeViewParameters) {
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
