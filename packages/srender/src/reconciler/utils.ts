import { popProvider } from '../context';
import { arrify, getTag } from '../element';
import { cloneFiberNode, createFiberNode } from './fiber';
import {
	Context,
	FiberFlags,
	FC,
	Flags,
	Fiber,
	FiberTag,
	VNode,
	RootFiberNode
} from '../interface';
import { Lanes, NoLanes, intersectLanes, mergeLanes } from '../Lanes';
import { cloneChildrenHandlers, unwindWorks } from './core';

export function getRoot(fiber: Fiber): Fiber {
	let node = fiber;
	while (node.parent) {
		node = node.parent;
	}
	return node;
}

function markCurrentFiber(wip: Fiber | null, old: Fiber | null) {
	if (wip) wip.flags |= FiberFlags.PerformWork;
	if (old) old.flags &= ~FiberFlags.PerformWork;
}

export function cloneChildren(wipFiber: Fiber) {
	const oldFiber = wipFiber.alternate!;
	if (!oldFiber.child) return;
	let oldChild: Fiber | null | undefined = oldFiber.child;
	let prevChild: Fiber | null = null;
	for (let i = 0; oldChild; i++, oldChild = oldChild.sibling) {
		const newChild = cloneFiberNode(oldChild, oldChild.pendingProps, {
			parent: wipFiber,
			index: i,
			alternate: oldChild
		});
		markCurrentFiber(newChild, oldChild);
		if (prevChild) prevChild.sibling = newChild;
		else wipFiber.child = newChild;
		prevChild = newChild;
		oldChild.alternate = null;
	}
}

export function reconcileChildrenArray(
	wipFiber: Fiber,
	newChildElements: any,
	lanes: Lanes
) {
	const elements = arrify(newChildElements) as VNode[];
	const needUpdate = !!intersectLanes(wipFiber.lanes, lanes);

	let oldFiber = wipFiber.alternate ? wipFiber.alternate.child : null;
	let newFiber: Fiber | null = null;
	const map = new Map<any, Fiber>();
	for (let node = oldFiber, i = 0; node; node = node.sibling, i++) {
		const key = node.key || node.index;
		map.set(key, node);
	}

	for (let index = 0; index < elements.length; index++) {
		const prevFiber = newFiber;
		const element = elements[index];
		const key = element ? element.props.key || index : null;
		const oldFiber = map.get(key);
		if (oldFiber && oldFiber.type === element.type) {
			newFiber = cloneFiberNode(oldFiber, element.props, {
				parent: wipFiber,
				alternate: oldFiber,
				memoizedProps: oldFiber.pendingProps,
				index,
				lanes: needUpdate ? mergeLanes(lanes, oldFiber.lanes) : oldFiber.lanes
			});
			map.delete(key);
		} else {
			newFiber = createFiberNode(getTag(element), element.props, {
				parent: wipFiber,
				index,
				memoizedProps: element.props,
				type: element.type,
				lanes
			});
		}
		// markCurrentFiber(newFiber, oldFiber || null);

		if (index === 0) {
			wipFiber.child = newFiber;
		} else if (prevFiber) prevFiber.sibling = newFiber;
	}
	for (const node of map.values()) deleteChild(node, wipFiber);
	map.clear();
}

export function deleteChild(fiber: Fiber, parent?: Fiber | null) {
	fiber.flags |= FiberFlags.Deletion;
	parent = parent || fiber.parent;
	if (parent) {
		parent.effects = parent.effects || [];
		parent.effects.push(fiber);
	}
}

const suspenseHandlers: Fiber[] = [];
export function getSuspenseHander() {
	return suspenseHandlers[suspenseHandlers.length - 1];
}
export function popSuspenseHander() {
	suspenseHandlers.pop();
}
export function pushSuspenseHander(fiber: Fiber) {
	suspenseHandlers.push(fiber);
}
export function clearSuspenseHander() {
	suspenseHandlers.length = 0;
}

function hideAllChildren(fiber: Fiber) {
	let node: Fiber | undefined | null = fiber.child;

	while (node) {
		if (node.tag === FiberTag.HostComponent) {
			(node.stateNode as HTMLElement).style.display = 'none';
		} else {
			hideAllChildren(node);
		}
		node = node.sibling;
	}
}

function unhideAllChildren(fiber: Fiber) {
	let node: Fiber | undefined | null = fiber.child;
	while (node) {
		if (node.tag === FiberTag.HostComponent) {
			(node.stateNode as HTMLElement).style.display = '';
		} else {
			unhideAllChildren(node);
		}
		node = node.sibling;
	}
}

export function unwindWork(fiber: Fiber, lanes?: Lanes) {
	const flags = fiber.flags;
	if (lanes || lanes === NoLanes) {
		unwindWorks.push(fiber);
		if (fiber.parent) {
			const childEffects = fiber.effects || [];
			const thisEffect = fiber.flags > FiberFlags.PerformWork ? [fiber] : [];
			const parentEffects = fiber.parent.effects || [];
			fiber.parent.effects = parentEffects.concat(childEffects, thisEffect);
		} else {
			const root = fiber.stateNode as RootFiberNode;
			root.finishedWork = fiber;
		}
	}
	switch (fiber.tag) {
		case FiberTag.Suspense:
			popSuspenseHander();

			if (flags & Flags.ShouldCapture && !(flags & Flags.DidCapture)) {
				fiber.flags = (flags & ~Flags.ShouldCapture) | Flags.DidCapture;
			}
			return fiber;
		case FiberTag.ContextProvider:
			const ctx = (fiber.type as FC)._context as Context;
			popProvider(ctx);
			return;
	}
}

export function unwindUnit(fiber: Fiber, lanes: Lanes) {
	fiber.lanes &= ~lanes;
	fiber.childLanes &= ~lanes;
	const oldFiber = fiber.alternate;
	if (oldFiber) oldFiber.alternate = fiber;
	markCurrentFiber(fiber, oldFiber);
	switch (fiber.tag) {
		case FiberTag.Offscreen:
			return fiber.pendingProps.mode === 'hidden'
				? hideAllChildren(fiber)
				: unhideAllChildren(fiber);
	}
}

function _cloneChildren(firstChild: Fiber | null, parent: Fiber) {
	let next = firstChild;
	parent.child = firstChild;
	while (next) {
		next.parent = parent;
		next = next.sibling;
	}
}

export function cloneFiberChildren(firstChild: Fiber | null, parent: Fiber) {
	cloneChildrenHandlers.push(() => _cloneChildren(firstChild, parent));
}

export function getLatestFiber(fiber: Fiber): Fiber {
	let node = fiber;

	while (node.alternate) {
		if (node.alternate.alternate === node) {
			if (node.alternate.flags & FiberFlags.PerformWork) node = node.alternate;
			break;
		}
		node = node.alternate;
	}

	return node;
}

export function putRef(fiber: Fiber) {
	const { ref } = fiber;

	if (ref && fiber.stateNode)
		typeof ref === 'function'
			? ref(fiber.stateNode)
			: (ref.current = fiber.stateNode);
}

function defaultShouldSkip(node: Fiber) {
	return false;
}
type SkipFn = (n: Fiber) => boolean;
export function traverseFiber(
	root: Fiber,
	shouldSkip: SkipFn = defaultShouldSkip,
	check?: SkipFn
) {
	if (!shouldSkip(root) && root.child) return root.child;
	let cursor: Fiber | null = root;
	while (cursor) {
		if (check && check(cursor)) break;
		if (cursor.sibling) return cursor.sibling;
		cursor = cursor.parent;
	}
	return null;
}
