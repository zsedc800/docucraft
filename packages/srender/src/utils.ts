import { createElement } from './element';
import { SuspenseException } from './reconciler/handleThrow';
import {
	ComponentChildren,
	ComponentType,
	FunctionComponent,
	IProps,
	Ref
} from './interface';

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

export const createRef = <T = any>(initialVal: T): { current: T } => {
	return { current: initialVal };
};

export const forwardRef =
	<P = {}, T = any>(
		render: (props: P, ref: Ref<T>) => ComponentChildren
	): FunctionComponent<{ ref: Ref<T> } & P> =>
	(props) =>
		render(props, props.ref);

export const wrapPromise = <T = any>(promise: Promise<T>) => {
	let status: 'pending' | 'fulfilled' | 'rejected' = 'pending',
		result: T;
	const next = promise.then(
		(res) => {
			status = 'fulfilled';
			result = res;
		},
		(reason) => {
			status = 'rejected';
			result = reason;
		}
	);

	return {
		read(): T {
			switch (status) {
				case 'pending':
					throw new SuspenseException(next);
				case 'fulfilled':
					return result;
				case 'rejected':
				default:
					throw result;
			}
		}
	};
};

export const lazy = <P extends IProps, T extends ComponentType<P>>(
	load: () => Promise<{ default: T }>
): ((p: P) => any) => {
	const p = load();

	const { read } = wrapPromise(p);

	return (props: P) => createElement(read().default as any, props);
};
