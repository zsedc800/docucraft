import { useRef } from '@docucraft/srender';
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
