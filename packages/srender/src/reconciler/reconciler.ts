import { createDomElement } from '../domUtils';
import { domMap } from '../events';
import { createWorkInProgress } from './fiberHooks';
import {
	Flags,
	FunctionComponent,
	Fiber,
	FiberTag,
	FiberFlags
} from '../interface';
import {
	mountClassComponent,
	mountSuspenseFallbackChildren,
	mountSuspensePrimaryChildren
} from './mount';
import {
	updateClassComponent,
	updateSuspenseFallbackChildren,
	updateSuspensePrimaryChildren
} from './update';
import {
	cloneFiberChildren,
	pushSuspenseHander,
	reconcileChildrenArray
} from './utils';
import { Lanes, OffscreenLane, PingLane, intersectLanes } from '../Lanes';

export function beginWork(wipFiber: Fiber, renderLanes: Lanes) {
	createWorkInProgress(wipFiber);
	if (
		!intersectLanes(wipFiber.lanes, renderLanes) &&
		!intersectLanes(wipFiber.childLanes, renderLanes)
	) {
		cloneFiberChildren(wipFiber.alternate?.child || null, wipFiber);
		return true;
	}
	switch (wipFiber.tag) {
		case FiberTag.FunctionComponent:
		case FiberTag.ContextProvider:
			processFunctionComponent(wipFiber, renderLanes);
			break;
		case FiberTag.ClassComponent:
			processClassComponent(wipFiber, renderLanes);
			break;
		case FiberTag.Suspense:
			processSuspenseComponent(wipFiber, renderLanes);
			break;
		case FiberTag.Offscreen:
			if (processOffscreenComponent(wipFiber, renderLanes)) return true;
			break;
		case FiberTag.Fragment:
			reconcileChildrenArray(
				wipFiber,
				wipFiber.pendingProps?.children,
				renderLanes
			);
			break;
		case FiberTag.HostRoot:
		case FiberTag.HostComponent:
		case FiberTag.HostText:
			processHostComponent(wipFiber, renderLanes);
			break;
	}
	return false;
}

function processOffscreenComponent(fiber: Fiber, lanes: Lanes) {
	let children = fiber.pendingProps.children;

	if (fiber.pendingProps.mode === 'hidden') {
		console.log(fiber.lanes, fiber, 'xx');

		fiber.lanes |= PingLane;
		cloneFiberChildren(fiber.alternate?.child || null, fiber);

		return true;
	}

	reconcileChildrenArray(fiber, children, lanes);
}

function processSuspenseComponent(wipFiber: Fiber, lanes: Lanes) {
	const current = wipFiber.alternate;
	const nextPrimaryChildren = wipFiber.pendingProps.children;
	const nextFallbackChildren = wipFiber.pendingProps.fallback;
	let showFallback = false;
	const DidCapture = (wipFiber.flags & Flags.DidCapture) !== Flags.NONE;

	if (DidCapture) {
		showFallback = true;
		wipFiber.flags &= ~FiberFlags.DidCapture;
	}

	pushSuspenseHander(wipFiber);

	if (current) {
		if (showFallback)
			updateSuspenseFallbackChildren(
				wipFiber,
				nextPrimaryChildren,
				nextFallbackChildren,
				lanes
			);
		else updateSuspensePrimaryChildren(wipFiber, nextPrimaryChildren, lanes);
	} else {
		if (showFallback)
			mountSuspenseFallbackChildren(
				wipFiber,
				nextPrimaryChildren,
				nextFallbackChildren,
				lanes
			);
		else mountSuspensePrimaryChildren(wipFiber, nextPrimaryChildren, lanes);
	}
}

function processFunctionComponent(wipFiber: Fiber, lanes: Lanes) {
	const newChildElements = (wipFiber.type as FunctionComponent)(
		wipFiber.pendingProps
	);

	reconcileChildrenArray(wipFiber, newChildElements, lanes);
}

function processClassComponent(wipFiber: Fiber, lanes: Lanes) {
	if (wipFiber.alternate) updateClassComponent(wipFiber, lanes);
	else mountClassComponent(wipFiber, lanes);
}

function processHostComponent(wipFiber: Fiber, lanes: Lanes) {
	if (!wipFiber.stateNode) {
		wipFiber.stateNode = createDomElement(wipFiber) as Element;
	}
	domMap.set(wipFiber.stateNode as HTMLElement, wipFiber);
	const newChildElements = wipFiber.pendingProps.children;
	reconcileChildrenArray(wipFiber, newChildElements, lanes);
}
