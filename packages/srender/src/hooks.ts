import { Context, Fiber, HookEffect, IFiber, ITag, Ref } from './interface';
import {
	createUpdateQueue,
	createWorkInProgressHook,
	processHookState
} from './reconciler/fiberHooks';
import { wait } from './utils';

export const useRef: <T = any>(initValue: T) => { current: T } = (
	initValue
) => {
	const hook = createWorkInProgressHook({ current: initValue });
	return hook.state;
};

export const useState = <T = any>(initialState: T) => {
	const ref = useRef<Fiber | null>(null);
	const hook = createWorkInProgressHook(
		typeof initialState === 'function' ? initialState() : initialState,
		ref
	);
	if (!hook.queue) createUpdateQueue(hook, ref);
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
			? () => {
					effectHook.destroy = callback();
				}
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

export const useContext = <T>(context: Context<T>): T => {
	return context.currentValue;
};
