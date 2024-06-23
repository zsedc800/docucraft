import { Component } from './component';
import { ClassComponent, IFiber } from './interface';

export function catchError(
	error: any,
	fiber: IFiber,
	oldFiber?: IFiber,
	errorInfo?: any
) {
	let component, ctor, handled;
	let current: IFiber | null | undefined = fiber;
	for (; (current = current.parent); ) {
		if (
			(component = fiber.stateNode) &&
			component instanceof Component &&
			!component._processingException
		) {
			try {
				ctor = fiber.type as ClassComponent;

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
