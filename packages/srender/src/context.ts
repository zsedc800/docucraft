import { Context } from './interface';

export const createContext = <T = any>(initialValue: T): Context<T> => {
	let currentValue = initialValue;
	return {
		currentValue,
		Provider: ({ value, children }: { value: T; children: any }) => {
			currentValue = value;
			return children;
		},
		Consumer: ({ children }) => children(currentValue)
	};
};
