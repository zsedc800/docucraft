import { Lanes } from '../Lanes';
import { Component, createInstance } from '../component';
import {
	ClassComponent,
	ComponentChildren,
	Fiber,
	FiberTag
} from '../interface';
import { createFiberNode } from './fiber';
import { reconcileChildrenArray } from './utils';
export function mountClassComponent(wipFiber: Fiber, lanes: Lanes) {
	const instance: Component = (wipFiber.stateNode = createInstance(wipFiber));

	const Ctor = wipFiber.type as ClassComponent;
	let nextState = Object.assign({}, instance.state);
	const nextContext = Ctor.contextType?.currentValue;

	if (Ctor.getDerivedStateFromProps)
		nextState = Ctor.getDerivedStateFromProps(wipFiber.pendingProps, nextState);

	instance.context = nextContext;
	instance.props = wipFiber.pendingProps;
	instance.state = nextState;
	wipFiber.memoizedState = nextState;

	reconcileChildrenArray(wipFiber, instance.render(), lanes);
}
export function mountSuspenseFallbackChildren(
	fiber: Fiber,
	primaryChildren: ComponentChildren,
	fallbackChildren: ComponentChildren,
	lanes: Lanes
) {
	const offscreen: Fiber = createFiberNode(
		FiberTag.Offscreen,
		{ mode: 'hidden', children: primaryChildren },
		{ parent: fiber, index: 0, lanes }
	);
	const fallback: Fiber = createFiberNode(
		FiberTag.Fragment,
		{ children: fallbackChildren },
		{ parent: fiber, index: 1, lanes }
	);
	offscreen.sibling = fallback;
	fiber.child = offscreen;
}

export function mountSuspensePrimaryChildren(
	fiber: Fiber,
	primaryChildren: ComponentChildren,
	lanes: Lanes
) {
	const offscreen = createFiberNode(
		FiberTag.Offscreen,
		{ mode: 'visible', children: primaryChildren },
		{ parent: fiber, lanes }
	);
	fiber.child = offscreen;
}
