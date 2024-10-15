import {
	ensureRootIsScheduled,
	scheduleUpdateOnFiber,
	workInProgressRoot
} from './core';
import {
	Lane,
	Lanes,
	NoLanes,
	isSubsetOfLanes,
	mergeLanes,
	requestUpdateLane
} from '../Lanes';
import { Component } from '../component';
import {
	ClassComponent,
	ComponentChildren,
	Fiber,
	FiberTag,
	Hooks,
	RootFiberNode,
	State,
	Update,
	UpdatePayload,
	UpdateQueue,
	UpdateState
} from '../interface';
import { getCurrentTime } from '../scheduler';
import { cloneFiberNode, createFiberNode } from './fiber';
import {
	cloneChildren,
	deleteChild,
	getLatestFiber,
	reconcileChildrenArray
} from './utils';
export function createUpdate<S extends State = State, P = {}>(
	payload: UpdatePayload<S, P>,
	eventTime: number,
	lane: Lane,
	tag = UpdateState.updateState
): Update<S, P> {
	return {
		eventTime,
		lane,
		tag,
		payload,
		next: null
	};
}

export class Updater<S extends State = State, P = {}> {
	constructor(private instance: Component<P, S, any>) {}
	setState(fiber: Fiber, state: UpdatePayload<S, P>, callback?: () => void) {
		fiber = getLatestFiber(fiber);
		const lane = requestUpdateLane();
		fiber.lanes |= lane;
		const update = createUpdate<S, P>(
			state,
			getCurrentTime(),
			lane,
			UpdateState.updateState
		);
		if (!fiber.updateQueue)
			fiber.updateQueue = initializeUpdateQueue(this.instance.state);
		if (callback) fiber.updateQueue.onCommit = callback;
		enqueueUpdate<S, P>(fiber.updateQueue, update);
		scheduleUpdateOnFiber(fiber);
	}
}

export function enqueueUpdate<S extends State = State, P = {}>(
	queue: UpdateQueue<S, P>,
	update: Update<S, P>
) {
	const sharedQueue = queue.shared;
	const pending = sharedQueue.pending;
	if (!pending) {
		update.next = update;
	} else {
		update.next = pending.next;
		pending.next = update;
	}
	sharedQueue.pending = update;
}

function getStateFromUpdate(update: Update, prevState: any, nextProps: any) {
	switch (update.tag) {
		case UpdateState.replaceState:
		case UpdateState.updateState: {
			const payload = update.payload;
			const partialState =
				typeof payload === 'function' ? payload(prevState, nextProps) : payload;
			return update.tag === UpdateState.replaceState
				? partialState
				: Object.assign({}, prevState, partialState);
		}
		default:
			return prevState;
	}
}

export function initializeUpdateQueue<T = State, P = {}>(
	memoizedState: T
): UpdateQueue<T, P> {
	return {
		baseState: memoizedState,
		firstBaseUpdate: null,
		lastBaseUpdate: null,
		shared: { pending: null },
		effects: []
	};
}

export function processUpdateQueue(
	wip: Fiber,
	hooks: Hooks | ((e: any) => void) | null,
	queue: UpdateQueue | null,
	renderLanes: Lanes
) {
	if (!queue) return;
	let { firstBaseUpdate, lastBaseUpdate, shared } = queue;
	let pendingQueue = shared.pending;

	if (pendingQueue) {
		shared.pending = null;
		const lastPendingUpdate = pendingQueue;
		const firstPendingUpdate = lastPendingUpdate.next;
		lastPendingUpdate.next = null;
		if (lastBaseUpdate) {
			lastBaseUpdate.next = firstPendingUpdate;
		} else {
			firstBaseUpdate = firstPendingUpdate;
		}
		lastBaseUpdate = lastPendingUpdate;
	}

	if (firstBaseUpdate) {
		let newState = queue.baseState;
		let newLanes = NoLanes;
		let newBaseState: State | null = null;
		let newFirstBaseUpdate = null;
		let newLastBaseUpdate = null;
		let update: Update | null = firstBaseUpdate;
		do {
			const updateLane = update.lane;
			if (!isSubsetOfLanes(renderLanes, updateLane)) {
				const clone: Update = {
					eventTime: update.eventTime,
					lane: updateLane,
					tag: update.tag,
					payload: update.payload,
					next: null
				};
				if (!newLastBaseUpdate) {
					newFirstBaseUpdate = newLastBaseUpdate = clone;
					newBaseState = newState;
				} else {
					newLastBaseUpdate.next = clone;
					newLastBaseUpdate = newLastBaseUpdate.next;
				}
				newLanes = mergeLanes(newLanes, updateLane);
			} else {
				newState = getStateFromUpdate(update, newState, wip.pendingProps);
			}
			update = update.next;
		} while (update);

		if (!newLastBaseUpdate) {
			newBaseState = newState;
		}
		if (typeof hooks === 'function') {
			hooks(newBaseState);
		} else if (hooks) {
			hooks.state = newBaseState;
		} else {
			// wip.memoizedState = newBaseState;
		}
		queue.baseState = newBaseState!;
		queue.firstBaseUpdate = newFirstBaseUpdate;
		queue.lastBaseUpdate = newLastBaseUpdate;
	}
}

export function markUpdateFromFiberToRoot(fiber: Fiber) {
	let parent = fiber.parent,
		node = fiber;
	while (parent) {
		parent.childLanes |= mergeLanes(node.lanes, node.childLanes);
		node = parent;
		parent = parent.parent;
	}

	if (node.tag !== FiberTag.HostRoot) {
		return null;
	}
	const root = node.stateNode as RootFiberNode;

	root.pendingLanes = mergeLanes(node.lanes, node.childLanes);
	return root;
}

export function enqueueSetState<T extends State = any, P = {}>(
	fiber: Fiber,
	state: UpdatePayload<T, P>
) {
	const lane = requestUpdateLane();
	const update = createUpdate<T, P>(state, getCurrentTime(), lane);
	fiber.lanes |= lane;
	if (!fiber.updateQueue)
		fiber.updateQueue = initializeUpdateQueue(fiber.memoizedState);
	enqueueUpdate<T, P>(fiber.updateQueue, update);
	scheduleUpdateOnFiber(fiber);
}

export let isBatchingUpdates = false;
export const setBatchingUpdates = (e: boolean) => (isBatchingUpdates = e);
export function batchedUpdates<R = any>(
	fn: (...a: any[]) => R,
	...a: any[]
): R {
	const previousIsBatchingUpdates = isBatchingUpdates;
	isBatchingUpdates = true;
	try {
		return fn(...a);
	} finally {
		isBatchingUpdates = previousIsBatchingUpdates;
		if (!isBatchingUpdates) {
			workInProgressRoot && ensureRootIsScheduled(workInProgressRoot);
		}
	}
}

export function updateClassComponent(wipFiber: Fiber, lanes: Lanes) {
	const instance: Component = wipFiber.stateNode as Component;
	const Ctor = wipFiber.type as ClassComponent;
	let nextState = wipFiber.memoizedState as State;
	const nextContext = Ctor.contextType?.currentValue;
	const pendingProps = Object.assign(
		{},
		Ctor.defaultProps,
		wipFiber.pendingProps
	);

	if (Ctor.getDerivedStateFromProps) {
		nextState = Object.assign(
			{},
			nextState,
			Ctor.getDerivedStateFromProps(pendingProps, nextState)
		);
	}

	processUpdateQueue(
		wipFiber,
		(state) => Object.assign(nextState, state),
		wipFiber.updateQueue,
		lanes
	);

	if (!instance.shouldComponentUpdate(pendingProps, nextState, nextContext)) {
		return cloneChildren(wipFiber);
	}

	const prevState = instance.state;
	const prevProps = instance.props;

	instance.context = nextContext;
	instance.props = pendingProps;
	instance.state = nextState;
	wipFiber.memoizedState = nextState;

	reconcileChildrenArray(wipFiber, instance.render(), lanes);
	if (instance.getSnapshotBeforeUpdate) {
		instance._snapshot = instance.getSnapshotBeforeUpdate(
			prevProps,
			prevState!
		);
	}
}
export function updateSuspenseFallbackChildren(
	fiber: Fiber,
	primaryChildren: ComponentChildren,
	fallbackChildren: ComponentChildren,
	lanes: Lanes
) {
	const oldFiber = fiber.alternate?.child as Fiber;
	const offscreen = cloneFiberNode(
		oldFiber,
		{
			mode: 'hidden',
			children: primaryChildren
		},
		{ parent: fiber, index: 0, lanes, alternate: oldFiber }
	);

	oldFiber.alternate = offscreen;
	const fallback = oldFiber.sibling
		? cloneFiberNode(
				oldFiber.sibling,
				{ children: fallbackChildren },
				{ parent: fiber, index: 1, lanes: mergeLanes(oldFiber.lanes, lanes) }
			)
		: createFiberNode(
				FiberTag.Fragment,
				{ children: fallbackChildren },
				{ parent: fiber, index: 1, lanes }
			);
	if (oldFiber.sibling) deleteChild(oldFiber.sibling, fiber);
	offscreen.sibling = fallback;
	fiber.child = offscreen;
}
export function updateSuspensePrimaryChildren(
	fiber: Fiber,
	primaryChildren: ComponentChildren,
	lanes: Lanes
) {
	const oldFiber = fiber.alternate?.child as Fiber;
	const offscreen = cloneFiberNode(
		oldFiber,
		{
			mode: 'visible',
			children: primaryChildren
		},
		{ parent: fiber, index: 0, lanes, alternate: oldFiber }
	);
	oldFiber.alternate = offscreen;
	oldFiber.sibling && deleteChild(oldFiber.sibling, fiber);
	fiber.child = offscreen;
}
