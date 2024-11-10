import { ExtendedComponent } from './element';
import { Context, FC, HookEffect, Ref, RefObject } from './interface';
import { currentBatchConfig } from './reconciler/core';
import {
	createUpdateQueue,
	createWorkInProgressHook,
	processHookState
} from './reconciler/fiberHooks';
import { shallowEqual, wait } from './utils';

export const useRef: <T = any>(initValue: T | null) => RefObject<T> = (
	initValue
) => {
	const hook = createWorkInProgressHook({ current: initValue });
	return hook.state;
};

export const useState = <T = any>(
	initialState: T | null
): [T, (...args: any[]) => void] => {
	const hook = createWorkInProgressHook(
		typeof initialState === 'function' ? initialState() : initialState
	);
	if (!hook.queue) createUpdateQueue(hook);
	processHookState(hook);
	return [hook.state, hook.queue!.dispatch!];
};

function areDependenciesEqual(prevDeps: any, deps: any) {
	if (prevDeps === null) return false;
	if (!prevDeps && !deps) return false;
	if (!(Array.isArray(prevDeps) && Array.isArray(deps))) return false;

	for (let i = 0; i < deps.length; i++) {
		if (deps[i] !== prevDeps[i]) {
			return false;
		}
	}
	return true;
}

function callbackWrapper(
	callback: () => any,
	effectHook: HookEffect,
	deps?: any[],
	sync = true
) {
	const res = areDependenciesEqual(effectHook.deps, deps)
		? () => {}
		: sync
			? () => (effectHook.destroy = callback())
			: wait(() => (effectHook.destroy = callback()), 17);
	effectHook.deps = deps;
	return res;
}

export const useLayoutEffect = (callback: () => any, deps?: any[]) => {
	const effectHook: HookEffect = {
		create: callback
	};
	const hook = createWorkInProgressHook(effectHook);

	hook.state.create = callbackWrapper(callback, hook.state, deps);
};

export const useEffect = (
	callback: () => void | (() => void),
	deps?: any[]
) => {
	const effectHook: HookEffect = {
		create: callback
	};
	const hook = createWorkInProgressHook(effectHook);
	const oldDeps = hook.state.deps;
	hook.state.create = callbackWrapper(callback, hook.state, deps, false);
};

export const useMemo = <T = any>(callback: () => T, deps?: any[]): T => {
	const effectHook: { value: T | null; deps?: any[] } = {
		value: null
	};
	const hook = createWorkInProgressHook(effectHook);

	if (!areDependenciesEqual(hook.state.deps, deps)) {
		hook.state.value = callback();
	}
	hook.state.deps = deps;
	return hook.state.value!;
};

export const useCallback = (callback: (...args: any[]) => any, deps?: any[]) =>
	useMemo(() => callback, deps);

export const useImperativeHandle = <T, R extends T>(
	ref: Ref<T> | undefined,
	getRef: () => R,
	deps?: any[]
) => {
	if (!ref) return;
	const res = useMemo(getRef, deps);
	typeof ref === 'function' ? ref(res) : (ref.current = res);
};

export const useContext = <T>(context: Context<T>): T => {
	return context.currentValue;
};

function _startTransition(setPending: (b: boolean) => void, fn: () => void) {
	setPending(true);
	const prevTransition = currentBatchConfig.transition;
	currentBatchConfig.transition = 1;
	setPending(false);
	fn();
	currentBatchConfig.transition = prevTransition;
}

export function startTransition(fn: () => void) {
	_startTransition(() => {}, fn);
}

export const useTransition = () => {
	const [isPending, setPending] = useState(false);

	return [isPending, _startTransition.bind(null, setPending)];
};

export const useDebugValue = () => {};

const defaultEqualFn = (oldProps: any, newProps: any) =>
	shallowEqual(oldProps, newProps);
export function memo<P>(
	component: FC<P> | ExtendedComponent,
	arePropsEqual = defaultEqualFn
) {
	const fn = typeof component === 'function' ? component : component.render;
	const render = (p: P, ref: any) => {
		const props = useRef<P>(null);
		const res = useRef<any>(null);

		if (arePropsEqual(props.current, p)) return res.current;
		res.current = fn(p, ref);
		props.current = p;
		return res.current;
	};
	component.render = render;
	return typeof component === 'function' ? render : component;
}
