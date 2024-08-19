import { Component } from '../component';
import {
	ClassComponent,
	Flags,
	Fiber,
	RootFiberNode,
	FiberTag
} from '../interface';
import { ensureRootIsScheduled } from './core';
import { getLatestFiber, getSuspenseHander, unwindWork } from './utils';
import { Lanes } from '../Lanes';
import { markUpdateFromFiberToRoot } from './update';

function getNearestSuspense(fiber: Fiber) {
	let node: Fiber | null = fiber;
	while (node && node.tag !== FiberTag.Suspense) node = node.parent;
	return node ? getLatestFiber(node) : null;
}

function attachPingListener(fiber: Fiber, promise: Promise<any>) {
	const ping = () => {
		const suspense = getNearestSuspense(fiber);
		if (suspense) suspense.lanes |= fiber.lanes;

		const root = suspense ? markUpdateFromFiberToRoot(suspense) : null;
		root && ensureRootIsScheduled(root);
	};

	promise.then(ping, ping);
}

export function catchError(
	error: any,
	fiber: Fiber,
	lanes: Lanes,
	errorInfo?: any
) {
	let component, ctor, handled;
	let needPing = true;
	if (error instanceof SuspenseException) {
		error = error.promise;
		const suspenseBoundary = getSuspenseHander();

		if (suspenseBoundary) {
			suspenseBoundary.flags |= Flags.ShouldCapture;

			if (suspenseBoundary.memoizedState === error) needPing = false;

			suspenseBoundary.memoizedState = error;
		}
	}

	if (error instanceof Promise && needPing) {
		attachPingListener(fiber, error);
	}

	for (
		let current: Fiber | null | undefined = fiber;
		current;
		current = current.parent
	) {
		current.effects = []; // reset effect
		const next = unwindWork(current);

		if (next) return next;

		if ((component = fiber.stateNode) && component instanceof Component) {
			try {
				ctor = fiber.type as unknown as ClassComponent;

				if (ctor && ctor.getDerivedStateFromError) {
					component.setState(ctor.getDerivedStateFromError(error));
					handled = true;
				}

				if (component.componentDidCatch) {
					component.componentDidCatch(error, errorInfo || {});
					handled = true;
				}

				if (handled) {
					return;
				}
			} catch (e) {
				error = e;
			}
		}
	}

	throw error;
}

export class SuspenseException {
	constructor(public promise: Promise<any>) {}
}
