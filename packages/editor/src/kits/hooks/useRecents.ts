import { useEffect, useRef } from '@docucraft/srender';
import forceUpdate from './forceUpdate';

class LinkNode<K = any, T = any> {
	value: T;
	key: K;
	next: LinkNode<K, T> | null;
	prev: LinkNode<K, T> | null;
	constructor(key: K, val: T) {
		this.value = val;
		this.key = key;
		this.next = null;
		this.prev = null;
	}
}

export class LRUCache<K = number, T = number> {
	head: LinkNode<K, T> | null;
	tail: LinkNode<K, T> | null;
	cache: Map<K, LinkNode<K, T>>;
	capacity: number;
	constructor(capacity: number = 10) {
		this.capacity = capacity;
		this.cache = new Map();
		this.head = this.tail = null;
	}

	private add(node: LinkNode<K, T>) {
		if (!this.head) {
			this.head = this.tail = node;
			return;
		}

		node.next = this.head;
		this.head.prev = node;
		this.head = node;
	}

	private remove(node: LinkNode<K, T>) {
		if (!this.head) return;
		if (this.head === this.tail) {
			if (this.head === node) this.head = this.tail = null;
		} else if (node === this.head) {
			this.head = this.head.next!;
			this.head.prev = null;
		} else if (node === this.tail) {
			this.tail = this.tail.prev!;
			this.tail.next = null;
		} else {
			const { prev, next } = node;
			if (prev) {
				prev.next = next;
			}
			if (next) {
				next.prev = prev;
			}
		}
	}

	get(key: K) {
		const node = this.cache.get(key);
		if (node) {
			this.remove(node);
			this.add(node);
			return node.value;
		}
	}

	put(key: K, val: T) {
		let node = this.cache.get(key);
		if (node) {
			this.remove(node);
		} else if (this.cache.size >= this.capacity) {
			const tail = this.tail!;
			this.cache.delete(tail.key);
			this.remove(this.tail!);
		}
		node = new LinkNode(key, val);
		this.cache.set(key, node);
		this.add(node);
	}
	entries() {
		let node = this.head;
		const res: [K, T][] = [];
		while (node) {
			res.push([node.key, node.value]);
			node = node.next;
		}
		return res;
	}
	clear() {
		this.head = this.tail = null;
		this.cache.clear();
	}
}

function createCache<K, T>(persistanceKey: string, capacity = 10) {
	const cache = new LRUCache<K, T>(capacity);
	return {
		put: (key: K, val: T) => {
			cache.put(key, val);
			localStorage.setItem(persistanceKey, JSON.stringify(cache.entries()));
		},
		get: (key: K) => cache.get(key),
		entries: () => cache.entries(),
		init: (entries: [K, T][]) => {
			for (let i = entries.length - 1; i >= 0; i--) {
				const [key, val] = entries[i];
				cache.put(key, val);
			}
		}
	};
}

export default <K = number, T = number>(
	persistanceKey: string,
	capacity = 10
) => {
	const recents = useRef(createCache<K, T>(persistanceKey, capacity));
	const { update } = forceUpdate();
	useEffect(() => {
		try {
			const entries = JSON.parse(
				localStorage.getItem(persistanceKey) || '[]'
			) as [K, T][];
			recents.current.init(entries);
			update();
		} catch (e) {
			console.error(e);
		}
	}, []);
	return recents.current;
};
