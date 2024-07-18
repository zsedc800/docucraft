import { ContextProvider } from './element';
import { Context, FC, IFiber } from './interface';
import { createRef } from './utils';

export const createContext = <T = any>(initialValue: T): Context<T> => {
	const $currentValue = createRef(initialValue);
	const stackValue = [initialValue];
	const Provider = ({ value, children }: { value: T; children: any }) => {
		stackValue.push(value);
		return children;
	};

	const context: Context<T> = {
		get currentValue() {
			return stackValue[stackValue.length - 1];
		},
		pop() {
			stackValue.pop();
		},
		Provider,
		Consumer: ({ children }) => children($currentValue.current)
	};
	Provider._context = context;
	Provider.displayType = ContextProvider;
	return context;
};

export function popProvider(context: Context) {
	context.pop();
}
