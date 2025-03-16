import { MindNode } from './MindNode';

export class Slice {
	size: number;
	constructor(readonly content: MindNode[]) {}
	static Empty = new Slice([]);
}
