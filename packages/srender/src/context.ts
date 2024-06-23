import { Context } from './interface';
import { createRef } from './utils';

export const createContext = <T = any>(initialValue: T): Context<T> => {
	const $currentValue = createRef(initialValue);
	return {
		get currentValue() {
			return $currentValue.current;
		},
		Provider: ({ value, children }: { value: T; children: any }) => {
			$currentValue.current = value;

			return children;
		},
		Consumer: ({ children }) => children($currentValue.current)
	};
};
