import { MindNode } from './MindNode';
import { Slice } from './slice';

export abstract class Step {}

export class ReplaceStep extends Step {
	constructor(
		readonly from: number,
		readonly to: number,
		readonly slice: Slice
	) {
		super();
	}

	apply(root: MindNode) {}
	invert(root: MindNode) {
		return new ReplaceStep(
			this.from,
			this.from + this.slice.size,
			root.slice(this.from, this.to)
		);
	}
}
