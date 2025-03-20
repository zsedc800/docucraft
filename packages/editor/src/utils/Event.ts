type CallbackFn = (...args: any[]) => any;
export class EventEmitter {
	private callbacks: Record<string, CallbackFn[]> = {};
	on(type: string, handler: CallbackFn) {
		const callbacks = this.callbacks[type];
		if (callbacks) callbacks.push(handler);
		else this.callbacks[type] = [handler];
	}

	once(type: string, handler: CallbackFn) {
		let callbacks = this.callbacks[type];
		if (!callbacks) this.callbacks[type] = callbacks = [];
		const index = callbacks.length;
		callbacks.push((...args: any[]) => {
			handler(...args);
			callbacks.splice(index, 1);
		});
	}

	emit(type, ...args: any[]) {
		const callbacks = this.callbacks[type];
		for (const fn of callbacks) fn(...args);
	}
}
