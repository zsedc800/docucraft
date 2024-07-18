import { catchError } from './handleThrow';
import { registerEvent } from '../events';

import {
	ComponentChildren,
	FiberTag,
	Fiber,
	RootFiberNode,
	FiberFlags,
	Mode
} from '../interface';
import { commitWork } from './commit';
import { beginWork } from './reconciler';
import { clearSuspenseHander, unwindWork } from './utils';
import {
	UserBlockingPriority,
	scheduleCallback,
	shouldYield
} from '../scheduler';
import { cloneFiberNode, createFiberNode } from './fiber';
import { Lanes, NoLanes, SyncLane, mergeLanes } from '../Lanes';
let nextUnitOfWork: Fiber | null | undefined = null;
let pendingCommit: Fiber | null = null;
let rootFiberNode: RootFiberNode | null = null;
let workInProgressRoot: Fiber | null = null;
let workInProgressRootRenderLanes: Lanes = NoLanes;
registerEvent(document.body);

export function render(
	children: ComponentChildren,
	containerDom?: HTMLElement
) {
	if (!containerDom) containerDom = document.createElement('div');
	if (!rootFiberNode)
		rootFiberNode = {
			container: containerDom,
			mode: Mode.NoMode
		};
	renderOnRootFiber(children, containerDom, rootFiberNode);
	return containerDom;
}

export function createRoot() {
	const rootFiberNode: RootFiberNode = {
		container: null,
		mode: Mode.Concurrent
	};
	return {
		render: (children: ComponentChildren, dom: HTMLElement) =>
			renderOnRootFiber(children, dom, rootFiberNode),
		unmount() {}
	};
}

export function renderOnRootFiber(
	children: ComponentChildren,
	dom: HTMLElement,
	rootFiberNode: RootFiberNode
) {
	const { container, current, mode } = rootFiberNode;
	if (!container) rootFiberNode.container = dom;
	const pendingProps = { children };
	const root = current
		? cloneFiberNode(current, pendingProps)
		: createFiberNode(FiberTag.HostRoot, pendingProps, {
				stateNode: rootFiberNode,
				mode
			});
	rootFiberNode.current = root;
	root.lanes = SyncLane;
	root.pendingLanes = root.lanes;
	scheduleOnRoot(rootFiberNode);
}

function scheduleOnRoot(root: RootFiberNode) {
	ensureRootIsScheduled(root);
}

export function ensureRootIsScheduled(rootNode: RootFiberNode) {
	const root = rootNode.current;
	if (!root) return;
	root.effects = [];
	root.pendingLanes = mergeLanes(root.pendingLanes, root.childLanes);
	const lanes = getNextLanes(root);

	workInProgressRootRenderLanes = lanes;
	root.pendingLanes &= ~lanes;

	if (lanes === SyncLane) {
		return performSyncWorkOnRoot(root);
	} else {
		scheduleCallback(
			UserBlockingPriority,
			performConcurrentWorkOnRoot.bind(null, root)
		);
	}
}

function getNextLanes(root: Fiber): Lanes {
	const pendingLanes = root.pendingLanes;

	return pendingLanes;

	// return SyncLane;
}

function performSyncWorkOnRoot(root: Fiber) {
	performWork(root, workLoopSync);
}

function performConcurrentWorkOnRoot(root: Fiber) {
	performWork(root, workLoop);
}

function performWork(root: Fiber, workLoop: () => void) {
	clearSuspenseHander();
	nextUnitOfWork = cloneFiberNode(root, root.pendingProps, {
		alternate: root
	});
	while (nextUnitOfWork) {
		try {
			workLoop();
			break;
		} catch (error) {
			nextUnitOfWork = catchError(
				error,
				nextUnitOfWork,
				workInProgressRootRenderLanes
			);
		}
	}
}

function workLoopSync() {
	while (nextUnitOfWork) {
		nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
	}
	if (pendingCommit) {
		commitAllWork(pendingCommit);
	}
}

function workLoop() {
	while (nextUnitOfWork && shouldYield()) {
		nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
	}
	if (pendingCommit) commitAllWork(pendingCommit);
}

function performUnitOfWork(wipFiber: Fiber) {
	const skip = beginWork(wipFiber, workInProgressRootRenderLanes);

	if (wipFiber.child && !skip) {
		return wipFiber.child;
	}

	let uow: Fiber | null | undefined = wipFiber;
	while (uow) {
		completeWork(uow);

		if (uow.sibling) {
			return uow.sibling;
		}

		uow = uow.parent;
	}
}

function completeWork(fiber: Fiber) {
	unwindWork(fiber, workInProgressRootRenderLanes);
	if (fiber.parent) {
		const childEffects = fiber.effects || [];
		const thisEffect = fiber.flags > FiberFlags.PerformWork ? [fiber] : [];
		const parentEffects = fiber.parent.effects || [];
		fiber.parent.effects = parentEffects.concat(childEffects, thisEffect);
	} else {
		pendingCommit = fiber;
	}
}

function commitAllWork(fiber: Fiber) {
	(fiber.effects || []).forEach((f) => commitWork(f));

	(fiber.stateNode as RootFiberNode).current = fiber;
	nextUnitOfWork = null;
	pendingCommit = null;
}
