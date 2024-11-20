import { Ref, useRef } from '@docucraft/srender';
import { useCallback } from 'react';

export function useEvent<
	T extends (...args: any[]) => any,
	S extends { [x: string]: any } = { [x: string]: any }
>(fn: T, staticProps?: S) {
	const func = useRef(fn);
	func.current = fn;
	const callback: T & S = useCallback(
		(...args: Parameters<T>): ReturnType<T> => {
			return func.current!(...args);
		},
		[]
	) as T & S;
	return Object.assign(callback, staticProps);
}

function setRef<T>(node: T, ref?: Ref<T>) {
	typeof ref === 'function' ? ref(node) : ref ? (ref.current = node) : void 0;
}

export function useForkRef<T>(...refs: (Ref<T> | undefined)[]) {
	return (node: T) => {
		for (const ref of refs) setRef(node, ref);
	};
}
