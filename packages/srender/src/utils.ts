export function isSubclassOf(subClass: Function, superClass: Function) {
	let prototype = subClass.prototype
		? Object.getPrototypeOf(subClass.prototype)
		: void 0;

	while (prototype) {
		if (prototype === superClass.prototype) {
			return true;
		}
		prototype = Object.getPrototypeOf(prototype);
	}

	return false;
}

export const wait =
	<T extends (...args: any[]) => any>(fn: T, time: number) =>
	(...args: Parameters<T>) => {
		return new Promise<ReturnType<T>>((resolve) => {
			setTimeout(() => resolve(fn(...args)), time);
		});
	};