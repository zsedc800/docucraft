type CompareFn<T> = (a: T, b: T) => number;
export function adjustHeap<T = any>(
	list: T[],
	parent: number,
	end: number,
	compare: CompareFn<T>
) {
	if (parent < 0) return;
	for (let i = 2 * parent + 1; i < end; i = i * 2 + 1) {
		if (i + 1 < end && compare(list[i], list[i + 1]) <= 0) i++;
		if (compare(list[i], list[parent]) > 0) swap(list, i, parent);
		parent = i;
	}
}

export function swap<T = any>(list: T[], left: number, right: number) {
	let tmp: T = list[left];
	list[left] = list[right];
	list[right] = tmp;
}

export function heapify<T = any>(list: T[], compare: CompareFn<T>) {
	const { length: len } = list;
	const index = Math.floor(len / 2) - 1;
	for (let i = index; i >= 0; i--) adjustHeap(list, i, len, compare);
	return list;
}

export function heapSort<T = any>(list: T[], compare: CompareFn<T>) {
	const { length: len } = list;
	const index = Math.floor(len / 2) - 1;
	for (let i = index; i >= 0; i--) adjustHeap(list, i, len, compare);
	for (let i = len; i > 0; i--) {
		swap(list, 0, i - 1);
		adjustHeap(list, 0, i - 1, compare);
	}
	return list;
}

export class TaskQueue<T extends { sortIndex: number }> {
	private list: T[];
	private compare: CompareFn<T>;
	static defaultCompareFn = <T extends { sortIndex: number }>(a: T, b: T) =>
		b.sortIndex - a.sortIndex;

	constructor({ compare }: { compare?: CompareFn<T> } = {}) {
		this.list = [];
		this.compare = compare || TaskQueue.defaultCompareFn;
	}
	push(item: T) {
		const { list, compare } = this;
		list.push(item);
		const { length: len } = list;
		let i = len - 1;
		do {
			i = Math.floor((i + 1) / 2) - 1;
			adjustHeap(list, i, len, compare);
		} while (i > 0);
	}
	shift() {
		const { list, compare } = this;
		const item = list.shift();
		heapify(list, compare);
		return item;
	}
	pop() {
		return this.list.pop();
	}
	peek() {
		return this.list[0];
	}
}

export function createQueue<T extends { sortIndex: number }>() {
	const list: T[] = [];
	const compare = (a: T, b: T) => b.sortIndex - a.sortIndex;
	return {
		push: (item: T) => {
			list.push(item);
			const { length: len } = list;
			let i = len - 1;
			do {
				i = Math.floor((i + 1) / 2) - 1;
				adjustHeap(list, i, len, compare);
			} while (i > 0);
		},
		shift: () => {
			const item = list.shift();
			heapify(list, compare);
			return item;
		},
		pop: () => list.pop()
	};
}
