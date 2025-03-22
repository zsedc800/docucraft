import { mindNodeInstances } from './collaboration';
import { MindMap } from './mindMap';
import { MindNode } from './MindNode';

export interface Op {
	type: 'update' | 'add' | 'delete' | '';
	id: string;
	key?: string | number;
	oldValue?: any;
	value?: any;
}

function reverse({ type, id, value, oldValue, key }: Op): Op {
	const op: Op = { id, type, value, key };
	if (type === 'add') {
		op.type = 'delete';
	} else if (type === 'update') {
		op.oldValue = value;
		op.value = oldValue;
	} else if (type === 'delete') {
		op.type = 'add';
	}
	return op;
}

export function execOp({ type, id, key, value }: Op, mindMap: MindMap) {
	console.log(type, id, key, value, 'op');

	if (type === 'add') {
		const { parent } = value as MindNode;
		const before = parent.children.attached[key];
		parent.insertBefore(value, before);
	} else if (type === 'update') {
		const node = mindNodeInstances.get(id);
		if (node) node.set(key as any, value);
	} else if (type === 'delete') {
		const { parent } = value as MindNode;
		parent.removeChild(value);
	}
	mindMap.render();
}

export class History {
	private stack: Op[] = [];
	private index = -1;
	constructor(private capcity = 30) {}
	push(op: Op) {
		if (this.index + 1 === this.capcity) {
			this.stack.shift();
		}
		this.stack.push(op);
		this.index = this.stack.length - 1;
	}
	redo() {
		if (this.index + 1 < this.stack.length) {
			return this.stack[this.index++];
		}
	}
	undo() {
		if (this.index > 0) return reverse(this.stack[this.index--]);
	}
}
