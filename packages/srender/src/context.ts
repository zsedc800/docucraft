import { ContextProvider } from './element';
import { Context, RootFiberNode } from './interface';
import { workInProgressRoot } from './reconciler/core';
const resetHandlers: Array<() => void> = [];
export function resetContext() {
	for (const fn of resetHandlers) fn();
}

export const createContext = <T = any>(initialValue: T): Context<T> => {
	const stackValue = [initialValue];
	const map = new WeakMap<RootFiberNode, T[]>();
	const Provider = ({ value, children }: { value: T; children: any }) => {
		let stack = map.get(workInProgressRoot!);

		if (!stack) {
			stack = [initialValue];
			map.set(workInProgressRoot!, stack);
		}
		stack.push(value);
		return children;
	};

	resetHandlers.push(() => (stackValue.length = 1));

	const context: Context<T> = {
		get currentValue() {
			const stack = map.get(workInProgressRoot!);
			return stack ? stack[stack.length - 1] : initialValue;
		},
		pop() {
			let stack = map.get(workInProgressRoot!);
			stack?.pop();
			// stackValue.pop();
		},
		Provider,
		Consumer: ({ children }) => children(context.currentValue)
	};
	Provider._context = context;
	Provider.displayType = ContextProvider;
	return context;
};

export function popProvider(context: Context) {
	context.pop();
}
