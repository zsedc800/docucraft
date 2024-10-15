import { requestUpdateLane } from '../Lanes';
import { Fiber, Hooks, State, UpdatePayload, UpdateState } from '../interface';
import { getCurrentTime } from '../scheduler';
import { scheduleUpdateOnFiber, workInProgressRootRenderLanes } from './core';
import {
	createUpdate,
	enqueueUpdate,
	initializeUpdateQueue,
	processUpdateQueue
} from './update';
import { getLatestFiber } from './utils';
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
		next: null,
		fiber: workInProgress
	};
}

export function createWorkInProgressHook<T = any>(state: T): Hooks<T> {
	if (!firstWorkInProgressHook) {
		firstWorkInProgressHook = workInProgressHook = createHooks(state);
		workInProgress!.memoizedState = firstWorkInProgressHook;
	} else if (!workInProgressHook) {
		lastWorkInProgressHook!.next = workInProgressHook = createHooks(state);
	}
	lastWorkInProgressHook = workInProgressHook;
	workInProgressHook = workInProgressHook.next;
	lastWorkInProgressHook.fiber = workInProgress;
	return lastWorkInProgressHook;
}

export function processHookState(hook: Hooks) {
	if (workInProgress!.alternate)
		processUpdateQueue(
			workInProgress!,
			hook,
			hook.queue,
			workInProgressRootRenderLanes
		);
}

export function createUpdateQueue(hook: Hooks) {
	hook.queue = initializeUpdateQueue(hook.state);
	hook.queue.dispatch = dispatchState.bind(null, workInProgress, hook);
}

export function dispatchState<T extends State = State, P = {}>(
	fiber: Fiber | null,
	hook: Hooks,
	state: UpdatePayload<T, P>
) {
	// const { fiber } = hook;

	if (!fiber || hook.state === state) return;

	const current = getLatestFiber(fiber);
	const lane = requestUpdateLane();
	current.lanes |= lane;
	const update = createUpdate(
		state,
		getCurrentTime(),
		lane,
		UpdateState.replaceState
	);
	enqueueUpdate<T, P>(hook.queue!, update);
	scheduleUpdateOnFiber(current);
}
