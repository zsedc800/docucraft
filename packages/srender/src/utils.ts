import { ComponentChildren, FunctionComponent, Ref } from './interface';

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

export const createRef = <T = any>(initialVal: T): Ref<T> => {
	return { current: initialVal };
};

export const forwardRef =
	<P = {}, T = any>(
		render: (props: P, ref: Ref<T>) => ComponentChildren
	): FunctionComponent<{ ref: Ref<T> } & P> =>
	(props) =>
		render(props, props.ref);
