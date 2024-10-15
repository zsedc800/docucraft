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
import { batchedUpdates } from './update';
import { traverseFiber } from './utils';

function getHostParent(fiber: Fiber): HTMLElement | null {
	let domParentFiber = fiber.parent;
	while (
		domParentFiber &&
		domParentFiber.parent &&
		domParentFiber.tag !== FiberTag.Portal &&
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
	if (
		fiber.tag !== FiberTag.FunctionComponent &&
		fiber.tag !== FiberTag.ForwardRef
	)
		return;
	let hook: Hooks | null = fiber.memoizedState as Hooks;

	while (hook) {
		const fn =
			hook.state && typeof hook.state === 'object' ? hook.state[key] : null;
		if (typeof fn === 'function') fn();
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
	} else if (fiber.tag === FiberTag.ClassComponent) {
		(fiber.stateNode as Component).componentDidMount();
	}

	callEffect(fiber);

	fiber.flags &= ~FiberFlags.Placement;
}

function commitUpdate(fiber: Fiber) {
	if (fiber.tag === FiberTag.HostComponent || fiber.tag === FiberTag.HostText) {
		updateDomProperties(
			fiber.stateNode as HTMLElement,
			(fiber.alternate as Fiber).pendingProps,
			fiber.pendingProps
		);
	} else if (
		fiber.tag === FiberTag.ClassComponent &&
		fiber.stateNode instanceof Component
	) {
		const oldFiber = fiber.alternate;
		if (oldFiber) {
			batchedUpdates(() => {
				fiber.updateQueue?.onCommit?.();
				(fiber.stateNode as Component).componentDidUpdate(
					oldFiber.pendingProps,
					(oldFiber.stateNode as Component).state!
				);
			});
		}
	} else if (
		fiber.tag === FiberTag.Portal &&
		fiber.pendingProps.container !== fiber.stateNode
	) {
		// const oldNode = fiber.stateNode as HTMLElement;
		// fiber.stateNode = fiber.pendingProps.container as HTMLElement;
		// console.log(fiber.stateNode, 'stddd');
		// while (oldNode.firstChild) {
		// 	fiber.stateNode.appendChild(oldNode.firstChild);
		// }
	}

	callEffect(fiber);
	fiber.flags &= ~FiberFlags.Update;
}

const deleteChild = (domParent: HTMLElement, fiber: Fiber) => {
	let node: Fiber | null = fiber;
	while (node) {
		node = traverseFiber(
			node,
			(f) => {
				if (f.tag === FiberTag.Portal) return true;
				if (f.tag === FiberTag.HostComponent || f.tag === FiberTag.HostText) {
					domParent.removeChild(f.stateNode as Element);
					return true;
				}
				return false;
			},
			(f) => f === fiber
		);
	}
};

function commitDeletion(fiber: Fiber) {
	const domParent = getHostParent(fiber);

	const deleteChildren = (domParent: HTMLElement | null, fiber: Fiber) => {
		let node = fiber.child;
		while (domParent && node) {
			deleteChild(domParent, node);
			node = node.sibling;
		}
	};

	let node = fiber.child;
	while (node) {
		switch (node.tag) {
			case FiberTag.Portal:
				deleteChildren(node.stateNode as HTMLElement, node);
				break;
			case FiberTag.FunctionComponent:
				callEffect(node, 'destroy');
				break;
			case FiberTag.ClassComponent:
				(node.stateNode as Component).destory();
				break;
		}
		node = traverseFiber(
			node,
			(f) => false,
			(f) => f === fiber
		);
	}

	deleteChildren(domParent, fiber);
	fiber.flags &= ~FiberFlags.Deletion;
}

export function commitWork(fiber: Fiber) {
	if (fiber.tag === FiberTag.HostRoot) return;

	if (fiber.flags & FiberFlags.Placement) commitPlacement(fiber);

	if (fiber.flags & FiberFlags.Update) commitUpdate(fiber);

	if (fiber.flags & FiberFlags.Deletion) commitDeletion(fiber);
	fiber.effects = [];
}
