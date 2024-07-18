import { requestUpdateLane } from '../Lanes';
import { Fiber, Hooks, Ref, UpdateState } from '../interface';
import { getCurrentTime } from '../scheduler';
import {
	createUpdate,
	enqueueUpdate,
	initializeUpdateQueue,
	processUpdateQueue,
	scheduleUpdateOnFiber
} from './update';
let workInProgressHook: Hooks | null = null;
let firstWorkInProgressHook: Hooks | null = null;
let lastWorkInProgressHook: Hooks | null = null;
let workInProgress: Fiber | null = null;
export function createWorkInProgress(wip: Fiber) {
	workInProgressHook = firstWorkInProgressHook = wip.memoizedState as Hooks;
	workInProgress = wip;
}
function createHooks<T = any>(state: T): Hooks<T> {
	return {
		state,
		baseState: null,
		baseUpdate: null,
		queue: null,
		next: null
	};
}

export function createWorkInProgressHook<T = any>(
	state: T,
	ref?: Ref<Fiber | null>
): Hooks<T> {
	if (!firstWorkInProgressHook) {
		firstWorkInProgressHook = workInProgressHook = createHooks(state);
		workInProgress!.memoizedState = firstWorkInProgressHook;
	} else if (!workInProgressHook) {
		lastWorkInProgressHook!.next = workInProgressHook = createHooks(state);
	}
	if (ref) ref.current = workInProgress;
	lastWorkInProgressHook = workInProgressHook;
	workInProgressHook = workInProgressHook.next;
	return lastWorkInProgressHook;
}

export function processHookState(hook: Hooks) {
	if (workInProgress!.alternate)
		processUpdateQueue(workInProgress!, hook, hook.queue);
}

export function createUpdateQueue(hook: Hooks, fiber: Ref<Fiber | null>) {
	hook.queue = initializeUpdateQueue(hook.state);
	hook.queue.dispatch = dispatchState.bind(null, fiber, hook);
}

export function dispatchState<T = {}>(
	fiber: Ref<Fiber | null>,
	hook: Hooks,
	state: T | ((e: T) => T)
) {
	if (!fiber.current) return;
	const current = fiber.current;
	const lane = requestUpdateLane();
	current.lanes |= lane;
	const update = createUpdate(
		state,
		getCurrentTime(),
		lane,
		UpdateState.replaceState
	);
	enqueueUpdate(hook.queue!, update);
	console.log(lane, 'l');

	scheduleUpdateOnFiber(current);
}
