import { IFiber, ITag, Ref } from './interface';
import { batchUpdate } from './reconciler';

let currentFiber: Ref<IFiber | null> = { current: null };
export function initHooks(fiber?: IFiber) {
	if (!fiber) return {};
	let { refs, states, effects, layoutEffects } = fiber.hooks;
	if (refs) refs.index = 0;
	if (states) states.index = 0;
	if (effects) effects.index = 0;
	if (layoutEffects) layoutEffects.index = 0;
	return {
		refs,
		states,
		effects,
		layoutEffects
	};
}
export function setCurrentFiber(wip: IFiber) {
	currentFiber.current = wip;
}
function getCurrentFiber(): IFiber {
	return currentFiber.current!;
}
export const useRef: <T = any>(initValue?: T) => { current: T | null } = (
	initValue
) => {
	const wip = getCurrentFiber();
	let { refs } = wip.hooks;
	if (!refs) wip.hooks.refs = refs = { index: 0, values: [] };

	if (refs.index >= refs.values.length)
		refs.values.push({ current: initValue || null });

	return refs.values[refs.index++];
};

export const useState = <T = any>(initalState: T) => {
	const wip = getCurrentFiber();
	const currentFiber = useRef<IFiber>(wip);
	currentFiber.current = wip;
	let { states } = wip.hooks;
	if (!states) wip.hooks.states = states = { index: 0, values: [] };
	if (states.index >= states.values.length) states.values.push(initalState);
	const index = states.index;
	const setState = (st: T) => {
		states.values[index] = st;
		batchUpdate({
			from: ITag.FUNCTION_COMPONENT,
			fiber: currentFiber.current!
		});
	};
	return [states.values[states.index++], setState];
};

function areDependenciesEqual(prevDeps: any, deps: any) {
	if (prevDeps === null) return false;
	for (let i = 0; i < deps.length; i++) {
		if (deps[i] !== prevDeps[i]) {
			return false;
		}
	}
	return true;
}

export const useLayoutEffect = (
	callback: () => void | (() => void),
	deps?: any[]
) => {
	const wip = getCurrentFiber();
	const $deps = useRef(deps);
	let { layoutEffects } = wip.hooks;
	if (!layoutEffects)
		wip.hooks.layoutEffects = layoutEffects = { index: 0, values: [] };
	if (layoutEffects.index >= layoutEffects.values.length)
		layoutEffects.values.push({ callback, canRun: true });
	else if (!areDependenciesEqual($deps.current, deps)) {
		layoutEffects.values[layoutEffects.index] = { callback, canRun: true };
	} else {
		layoutEffects.values[layoutEffects.index].canRun = false;
	}
};

export const useEffect = (
	callback: () => void | (() => void),
	deps?: any[]
) => {
	const wip = getCurrentFiber();
	const $deps = useRef(deps);
	let { effects } = wip.hooks;
	if (!effects) wip.hooks.effects = effects = { index: 0, values: [] };
	if (effects.index >= effects.values.length)
		effects.values.push({ callback, canRun: true });
	else if (!areDependenciesEqual($deps.current, deps)) {
		effects.values[effects.index] = { callback, canRun: true };
	} else {
		effects.values[effects.index].canRun = false;
	}
};

export const useMemo = (callback: () => any, deps?: any[]) => {
	const cachedValue = useRef();
	const cachedDeps = useRef(deps);

	if (cachedValue.current) {
		if (!areDependenciesEqual(cachedDeps.current, deps))
			cachedValue.current = callback();
	} else {
		cachedValue.current = callback();
	}
	return cachedValue.current;
};
