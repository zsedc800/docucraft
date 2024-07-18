import { Component } from '../component';
import { ClassComponent, Flags, Fiber, RootFiberNode } from '../interface';
import { ensureRootIsScheduled } from '.';
import { getSuspenseHander, unwindWork } from './utils';
import { Lanes, PingLane } from '../Lanes';
import { markUpdateFromFiberToRoot } from './update';

function attachPingListener(root: RootFiberNode, promise: Promise<any>) {
	const ping = () => {
		ensureRootIsScheduled(root);
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

	if (error instanceof SuspenseException) {
		error = error.promise;
		const suspenseBoundary = getSuspenseHander();
		if (suspenseBoundary) suspenseBoundary.flags |= Flags.ShouldCapture;
	}

	if (error instanceof Promise) {
		fiber.lanes |= PingLane;
		const root = markUpdateFromFiberToRoot(fiber);
		if (root) attachPingListener(root, error);
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
