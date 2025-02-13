export interface HistroyItem {
	content: string;
	pos: number;
}

export class HistoryStack {
	constructor(private stackSize = 20) {}

	private histories: HistroyItem[] = [];
	private index = -1;

	get size() {
		return this.histories.length;
	}

	push(item: HistroyItem) {
		if (this.index + 1 === this.stackSize) {
			this.histories = this.histories.slice(1, this.index + 1);
		} else {
			this.histories = this.histories.slice(0, this.index + 1);
		}

		this.histories.push(item);
		this.index = this.histories.length - 1;
	}

	undo() {
		if (this.index <= 0) return null;
		this.index--;
		return this.histories[this.index];
	}

	redo() {
		if (this.index + 1 < this.histories.length) {
			this.index++;
			return this.histories[this.index];
		}

		return null;
	}
}
