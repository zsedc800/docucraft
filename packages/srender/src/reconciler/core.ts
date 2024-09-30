import { catchError } from './handleThrow';
import { registerEvent } from '../events';

import {
	ComponentChildren,
	FiberTag,
	Fiber,
	RootFiberNode,
	Mode,
	RootRender
} from '../interface';
import { commitWork } from './commit';
import { beginWork } from './reconciler';
import { clearSuspenseHander, unwindUnit, unwindWork } from './utils';
import { scheduleCallback, shouldYield } from '../scheduler';
import { cloneFiberNode, createFiberNode } from './fiber';
import {
	LaneToPriority,
	Lanes,
	NoLanes,
	SyncLane,
	getHighestPriorityLane
} from '../Lanes';
import { isBatchingUpdates, markUpdateFromFiberToRoot } from './update';
import { resetContext } from '../context';
let nextUnitOfWork: Fiber | null | undefined = null;
export let rootFiberNode: RootFiberNode | null = null;
export let workInProgressRoot: RootFiberNode | null = null;
export let workInProgressRootRenderLanes: Lanes = NoLanes;
export let currentBatchConfig: { transition: number | null } = {
	transition: null
};
export let unwindWorks: Fiber[] = [];
export let cloneChildrenHandlers: Array<() => void> = [];
if (typeof window !== 'undefined') registerEvent(document.body);

export function render(
	children: ComponentChildren,
	containerDom?: HTMLElement & { __rootFiber?: RootFiberNode }
) {
	if (!containerDom) containerDom = document.createElement('div');
	let { __rootFiber: rootFiberNode } = containerDom;
	if (!rootFiberNode)
		rootFiberNode = containerDom.__rootFiber = createRootFiber(
			containerDom,
			Mode.NoMode
		);
	renderOnRootFiber(children, containerDom, rootFiberNode);
	return containerDom;
}

export function createRoot(): RootRender {
	const rootFiberNode = createRootFiber(null, Mode.Concurrent);
	return {
		render: (children: ComponentChildren, dom?: HTMLElement) =>
			renderOnRootFiber(children, dom, rootFiberNode),
		unmount() {}
	};
}

export function createRootFiber(
	container: HTMLElement | null,
	mode: Mode
): RootFiberNode {
	return {
		container,
		mode,
		pendingLanes: NoLanes,
		expiredLanes: NoLanes,
		renderLanes: NoLanes,
		finishedWork: null,
		callbackNode: null,
		callbackId: NoLanes
	};
}

export function renderOnRootFiber(
	children: ComponentChildren,
	dom: HTMLElement | null = null,
	rootFiberNode: RootFiberNode
) {
	const { container, current, mode } = rootFiberNode;
	if (!container) rootFiberNode.container = dom;
	const pendingProps = { children };

	const root = current
		? cloneFiberNode(current, pendingProps, {
				child: current.child,
				sibling: current.sibling
			})
		: createFiberNode(FiberTag.HostRoot, pendingProps, {
				stateNode: rootFiberNode,
				mode
			});
	rootFiberNode.current = root;
	rootFiberNode.pendingLanes |= SyncLane;
	root.lanes |= SyncLane;
	workInProgressRoot = rootFiberNode;
	scheduleOnRoot(rootFiberNode);
}

function scheduleOnRoot(root: RootFiberNode) {
	ensureRootIsScheduled(root);
}

export function scheduleUpdateOnFiber(fiber: Fiber) {
	const root = markUpdateFromFiberToRoot(fiber);
	workInProgressRoot = root;
	if (!root) return;
	if (!isBatchingUpdates) ensureRootIsScheduled(root);
}

export function ensureRootIsScheduled(root: RootFiberNode) {
	const lanes = getNextLanes(root);
	workInProgressRootRenderLanes = lanes;
	root.pendingLanes &= ~lanes;

	if (root.callbackNode && lanes < root.callbackId) {
		root.callbackNode.callback = null;
		root.callbackNode = null;
		root.pendingLanes |= root.callbackId;
		root.callbackId = NoLanes;
		resetContext();
	}

	const priority = LaneToPriority(lanes);
	if (lanes === NoLanes) {
		return;
	} else if (lanes === SyncLane) {
		return performSyncWorkOnRoot(root);
	} else {
		root.callbackNode = scheduleCallback(
			priority,
			performConcurrentWorkOnRoot.bind(null, root)
		);
		root.callbackId = lanes;
	}
}

function getNextLanes(root: RootFiberNode): Lanes {
	const pendingLanes = root.pendingLanes;

	return getHighestPriorityLane(pendingLanes);
}

function performSyncWorkOnRoot(root: RootFiberNode) {
	performWork(root, workLoopSync);
}

function performConcurrentWorkOnRoot(root: RootFiberNode) {
	return performWork(root, workLoop);
}

function prepareStack() {
	clearSuspenseHander();
	unwindWorks = [];
	cloneChildrenHandlers.length = 0;
}

function performWork(
	root: RootFiberNode,
	workLoop: (root: RootFiberNode) => void
) {
	let { current } = root;
	if (!current) return;
	prepareStack();
	nextUnitOfWork = cloneFiberNode(current, current.pendingProps, {
		alternate: current
	});
	while (nextUnitOfWork) {
		try {
			return workLoop(root);
		} catch (error) {
			nextUnitOfWork = catchError(
				error,
				nextUnitOfWork,
				workInProgressRootRenderLanes
			);
		}
	}
}

function workLoopSync(root: RootFiberNode) {
	while (nextUnitOfWork) {
		nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
	}
	const { finishedWork } = root;
	if (finishedWork) {
		commitAllWork(finishedWork);
	}
}

function workLoop(root: RootFiberNode) {
	while (nextUnitOfWork && !shouldYield()) {
		nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
	}

	const { finishedWork } = root;
	if (finishedWork) {
		commitAllWork(finishedWork);
	} else {
		let prevWork = nextUnitOfWork;
		return () => {
			nextUnitOfWork = prevWork;
			return workLoop(root);
		};
	}
}

function performUnitOfWork(wipFiber: Fiber) {
	const skip = beginWork(wipFiber, workInProgressRootRenderLanes);
	wipFiber.memoizedProps = wipFiber.pendingProps;

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
}

function beforeCommit() {
	for (const fn of cloneChildrenHandlers) fn();
	for (const f of unwindWorks) unwindUnit(f, workInProgressRootRenderLanes);
}

function commitAllWork(fiber: Fiber) {
	beforeCommit();

	(fiber.effects || []).forEach((f) => commitWork(f));

	const root = fiber.stateNode as RootFiberNode;
	root.current = fiber;
	root.finishedWork = null;
	nextUnitOfWork = null;

	ensureRootIsScheduled(root);
}
