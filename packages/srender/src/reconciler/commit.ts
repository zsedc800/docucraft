import { Component } from '../component';
import { updateDomProperties } from '../domUtils';
import {
	Fiber,
	FiberFlags,
	FiberTag,
	HookEffect,
	Hooks,
	RootFiberNode
} from '../interface';

function getHostParent(fiber: Fiber): HTMLElement | null {
	let domParentFiber = fiber.parent;
	while (
		domParentFiber &&
		domParentFiber.parent &&
		domParentFiber.tag !== FiberTag.HostComponent &&
		domParentFiber.tag !== FiberTag.HostText
	) {
		domParentFiber = domParentFiber.parent;
	}

	if (!domParentFiber) return fiber.stateNode as HTMLElement;
	return domParentFiber.parent
		? (domParentFiber.stateNode as HTMLElement)
		: (domParentFiber.stateNode as RootFiberNode).container;
}

function getHostSibling(fiber: Fiber): Element | null {
	let node: Fiber = fiber;
	siblings: while (true) {
		while (!node.sibling) {
			if (!node.parent || node.parent.tag === FiberTag.HostComponent)
				return null;
			node = node.parent;
		}
		node.sibling.parent = node.parent;
		node = node.sibling;

		while (
			node.tag !== FiberTag.HostComponent &&
			node.tag !== FiberTag.HostText
		) {
			if (node.flags & FiberFlags.Placement || !node.child) continue siblings;
			node.child.parent = node;
			node = node.child;
		}

		if (!(node.flags & FiberFlags.Placement)) {
			return node.stateNode as Element;
		}
	}
}

function callEffect(fiber: Fiber, key: keyof HookEffect = 'create') {
	let hook: Hooks | null = fiber.memoizedState as Hooks;
	while (hook) {
		const create = hook.state[key];
		if (typeof create === 'function') create();
		hook = hook.next;
	}
}

function commitPlacement(fiber: Fiber) {
	const domParent = getHostParent(fiber);
	if (
		(fiber.tag === FiberTag.HostComponent || fiber.tag === FiberTag.HostText) &&
		domParent
	) {
		const before = getHostSibling(fiber);
		const node = fiber.stateNode as Element;

		if (before) domParent.insertBefore(node, before);
		else domParent.appendChild(node);
		if (fiber.ref) fiber.ref.current = fiber.stateNode;
	} else if (fiber.tag === FiberTag.ClassComponent) {
		(fiber.stateNode as Component).componentDidMount();
	} else if (fiber.tag === FiberTag.FunctionComponent) {
		callEffect(fiber);
	}
	fiber.flags &= ~FiberFlags.Placement;
}

function commitUpdate(fiber: Fiber) {
	if (fiber.tag === FiberTag.HostComponent || fiber.tag === FiberTag.HostText) {
		updateDomProperties(
			fiber.stateNode as HTMLElement,
			(fiber.alternate as Fiber).pendingProps,
			fiber.pendingProps
		);
	} else if (fiber.tag === FiberTag.FunctionComponent) {
		callEffect(fiber);
	} else if (
		fiber.tag === FiberTag.ClassComponent &&
		fiber.stateNode instanceof Component
	) {
		const oldFiber = fiber.alternate;
		if (oldFiber) {
			fiber.stateNode.componentDidUpdate(
				oldFiber.pendingProps,
				(oldFiber.stateNode as Component).state!
			);
		}
	}
	fiber.flags &= ~FiberFlags.Update;
}

function commitDeletion(fiber: Fiber) {
	let node: Fiber | null | undefined = fiber;
	const domParent = getHostParent(fiber);

	while (true && domParent) {
		if (!node) break;
		if (node.tag !== FiberTag.HostComponent && node.tag !== FiberTag.HostText) {
			node = node.child;
			continue;
		}

		domParent.removeChild(node.stateNode as Element);
		while (node !== fiber && !node.sibling) node = node.parent!;
		if (node === fiber) break;
		node = node.sibling;
	}

	const goStep = (node: Fiber): Fiber | undefined => {
		if (node.child) return node.child;
		let cursor: Fiber | null | undefined = node;
		while (cursor && cursor != fiber) {
			if (cursor.tag === FiberTag.FunctionComponent)
				callEffect(cursor, 'destroy');
			if (cursor.stateNode instanceof Component) cursor.stateNode.destory();

			if (cursor.sibling) return cursor.sibling;
			cursor = cursor.parent;
		}
	};
	while (node) node = goStep(node);
	fiber.flags &= ~FiberFlags.Deletion;
}

export function commitWork(fiber: Fiber) {
	if (fiber.tag === FiberTag.HostRoot) return;

	if (fiber.flags & FiberFlags.Placement) commitPlacement(fiber);

	if (fiber.flags & FiberFlags.Update) commitUpdate(fiber);

	if (fiber.flags & FiberFlags.Deletion) commitDeletion(fiber);
	fiber.effects = [];
}
