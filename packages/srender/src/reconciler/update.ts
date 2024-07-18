import { ensureRootIsScheduled } from '.';
import { Lane, Lanes, mergeLanes } from '../Lanes';
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
	UpdateQueue,
	UpdateState
} from '../interface';
import { cloneFiberNode, createFiberNode } from './fiber';
import { cloneChildren, deleteChild, reconcileChildrenArray } from './utils';

export function createUpdate(
	payload: any,
	eventTime: number,
	lane: Lane,
	tag = UpdateState.updateState
): Update {
	return {
		eventTime,
		lane,
		tag,
		payload,
		next: null
	};
}

export function enqueueUpdate(queue: UpdateQueue, update: Update) {
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

export function initializeUpdateQueue(memoizedState: State): UpdateQueue {
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
	hooks: Hooks | null,
	queue: UpdateQueue | null
) {
	if (!queue) return;
	let { firstBaseUpdate, lastBaseUpdate, shared } = queue;
	let pendingQueue = shared.pending;

	if (pendingQueue) {
		shared.pending = null;
		const lastPendingUpdate = pendingQueue;
		const firstPendingUpdate = lastPendingUpdate.next;
		lastPendingUpdate.next = null;
		if (!lastBaseUpdate) {
			firstBaseUpdate = firstPendingUpdate;
		} else {
			lastBaseUpdate.next = firstPendingUpdate;
		}
		lastBaseUpdate = lastPendingUpdate;
	}

	if (firstBaseUpdate) {
		let newState = queue.baseState;
		let update: Update | null = firstBaseUpdate;
		do {
			newState = getStateFromUpdate(update, newState, wip.pendingProps);
			update = update.next;
		} while (update);
		if (hooks) {
			hooks.state = newState;
		} else {
			wip.memoizedState = newState;
		}
		queue.baseState = newState;
		queue.firstBaseUpdate = null;
		queue.lastBaseUpdate = null;
	}
}

export function markUpdateFromFiberToRoot(fiber: Fiber) {
	let parent = fiber.parent,
		node = fiber;
	while (parent) {
		parent.childLanes = mergeLanes(node.lanes, node.childLanes);
		node = parent;
		parent = parent.parent;
	}
	return node.tag === FiberTag.HostRoot
		? (node.stateNode as RootFiberNode)
		: null;
}

export function scheduleUpdateOnFiber(fiber: Fiber) {
	const root = markUpdateFromFiberToRoot(fiber);

	if (!root) return;
	ensureRootIsScheduled(root);
}

export function updateClassComponent(wipFiber: Fiber, lanes: Lanes) {
	const instance: Component = wipFiber.stateNode as Component;
	const Ctor = wipFiber.type as ClassComponent;
	processUpdateQueue(wipFiber, null, wipFiber.updateQueue);
	let nextState = wipFiber.memoizedState as State;
	const nextContext = Ctor.contextType?.currentValue;
	if (
		!instance.shouldComponentUpdate(
			wipFiber.pendingProps,
			nextState,
			nextContext
		)
	) {
		return cloneChildren(wipFiber);
	}

	if (Ctor.getDerivedStateFromProps) {
		nextState = Ctor.getDerivedStateFromProps(wipFiber.pendingProps, nextState);
	}

	const prevState = instance.state;
	const prevProps = instance.props;

	instance.context = nextContext;
	instance.props = wipFiber.pendingProps;
	instance.state = nextState;
	// wipFiber.partialState = null;

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

	oldFiber.alternate = null;
	const fallback = oldFiber.sibling
		? cloneFiberNode(
				oldFiber.sibling,
				{ children: fallbackChildren },
				{ parent: fiber, index: 1 }
			)
		: createFiberNode(
				FiberTag.Fragment,
				{ children: fallbackChildren },
				{ parent: fiber, index: 1, lanes }
			);
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
	oldFiber.alternate = null;
	if (oldFiber?.sibling) deleteChild(oldFiber.sibling, fiber);
	fiber.child = offscreen;
}
