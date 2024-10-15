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
	putRef,
	reconcileChildrenArray
} from './utils';
import { Lanes, PingLane, TransitionLanes, intersectLanes } from '../Lanes';

export function beginWork(wipFiber: Fiber, renderLanes: Lanes) {
	createWorkInProgress(wipFiber);
	if (
		!intersectLanes(wipFiber.lanes, renderLanes) &&
		!intersectLanes(wipFiber.childLanes, renderLanes)
	) {
		wipFiber.flags &= ~FiberFlags.Update;
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
			if (processSuspenseComponent(wipFiber, renderLanes)) return true;
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
		case FiberTag.ForwardRef:
			processForwardRefComponent(wipFiber, renderLanes);
			break;
		case FiberTag.HostRoot:
		case FiberTag.HostComponent:
		case FiberTag.HostText:
		case FiberTag.Portal:
			processHostComponent(wipFiber, renderLanes);
			break;
	}
	return false;
}
let flag = false;

function processForwardRefComponent(fiber: Fiber, lanes: Lanes) {
	const { render, ...props } = fiber.pendingProps;

	let children = [];

	if (typeof render === 'function') children = render(props, fiber.ref);
	reconcileChildrenArray(fiber, children, lanes);
}

function processOffscreenComponent(fiber: Fiber, lanes: Lanes) {
	let children = fiber.pendingProps.children;

	if (fiber.pendingProps.mode === 'hidden') {
		fiber.lanes |= PingLane;
		cloneFiberChildren(fiber.alternate?.child || null, fiber);

		return true;
	}

	if (intersectLanes(fiber.lanes, TransitionLanes) && flag) {
		flag = false;
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
		if (
			intersectLanes(wipFiber.childLanes, TransitionLanes) &&
			wipFiber.alternate
		) {
			cloneFiberChildren(wipFiber.alternate?.child, wipFiber);
			return true;
		}
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
	return false;
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
	if (wipFiber.tag === FiberTag.Portal) {
		wipFiber.stateNode = wipFiber.pendingProps.container;
	}

	if (!wipFiber.stateNode) {
		wipFiber.stateNode = createDomElement(wipFiber) as Element;
		putRef(wipFiber);
		// if (wipFiber.ref) wipFiber.ref.current = wipFiber.stateNode;
	}
	domMap.set(wipFiber.stateNode as HTMLElement, wipFiber);
	const newChildElements = wipFiber.pendingProps.children;
	reconcileChildrenArray(wipFiber, newChildElements, lanes);
}
