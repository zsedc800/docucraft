import { catchError } from './catchError';
import { Component, createInstance } from './component';
import {
	cloneFiber,
	createDomElement,
	createFiber,
	updateDomProperties
} from './domUtils';
import { arrify, ELEMENT, FRAGMENT } from './element';
import { domMap, registerEvent } from './events';
import { setCurrentFiber } from './hooks';

import {
	ClassComponent,
	Effect,
	FunctionComponent,
	IdleDeadline,
	IdleRequestCallback,
	IFiber,
	ITag,
	IUpdate,
	IVNode
} from './interface';
import { wait } from './utils';

declare var requestIdleCallback: (fn: IdleRequestCallback) => number;

const ENOUGH_TIME = 1;

const updateQueue: IUpdate[] = [];
let nextUnitOfWork: IFiber | null | undefined = null;
let pendingCommit: IFiber | null = null;

registerEvent(document.body);

export function render(
	elements: any,
	containerDom?: HTMLElement,
	sync = false
) {
	if (!containerDom) containerDom = document.createElement('div');
	updateQueue.push({
		from: ITag.HOST_ROOT,
		dom: containerDom,
		newProps: { children: elements }
	});
	// if (!(containerDom as any)._rootContainerFiber) registerEvent(containerDom);
	if (sync)
		performWork({ timeRemaining: () => 1000 as any, didTimeout: false });
	else requestIdleCallback(performWork);

	return containerDom;
}

export function unMountComponentsAtNode(dom: HTMLElement) {
	const rootFiber: IFiber = (dom as any)._rootContainerFiber;
	const fiber = rootFiber ? rootFiber.child : void 0;
	if (fiber) commitDeletion(fiber);
	delete (dom as any)._rootContainerFiber;
}

export function batchUpdate(update: IUpdate) {
	updateQueue.push(update);
	requestIdleCallback(performWork);
}

function performWork(deadline: IdleDeadline) {
	workLoop(deadline);
	if (nextUnitOfWork || updateQueue.length > 0) {
		requestIdleCallback(performWork);
	}
}

function workLoop(deadline: IdleDeadline) {
	if (!nextUnitOfWork) {
		resetNextUnitOfWork();
	}

	while (nextUnitOfWork && deadline.timeRemaining() > ENOUGH_TIME) {
		nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
	}
	if (pendingCommit) {
		commitAllWork(pendingCommit);
	}
}

function resetNextUnitOfWork() {
	const update = updateQueue.shift();
	if (!update) {
		return;
	}

	const root =
		update.from === ITag.HOST_ROOT
			? (update.dom as any)._rootContainerFiber
			: getRoot(update.fiber!);

	nextUnitOfWork = {
		tag: ITag.HOST_ROOT,
		$$typeof: ELEMENT,
		hooks: {},
		index: 0,
		stateNode: update.dom || root.stateNode,
		effectTag: Effect.NOTHING,
		props: update.newProps || root.props,

		alternate: root
	};
}

function getRoot(fiber: IFiber): IFiber {
	let node = fiber;
	while (node.parent) {
		node = node.parent;
	}
	return node;
}

function performUnitOfWork(wipFiber: IFiber) {
	beginWork(wipFiber);

	if (wipFiber.child) {
		return wipFiber.child;
	}

	let uow: IFiber | null | undefined = wipFiber;
	while (uow) {
		completeWork(uow);

		if (uow.sibling) {
			return uow.sibling;
		}

		uow = uow.parent;
	}
}

function beginWork(wipFiber: IFiber) {
	setCurrentFiber(wipFiber);
	try {
		switch (wipFiber.tag) {
			case ITag.FUNCTION_COMPONENT:
				updateFunctionComponent(wipFiber);
				break;
			case ITag.CLASS_COMPONENT:
				updateClassComponent(wipFiber);
				break;
			case ITag.HOST_ROOT:
			case ITag.HOST_COMPONENT:
			case ITag.HOST_TEXT:
				updateHostComponent(wipFiber);
				break;
		}
		if (wipFiber.$$typeof === FRAGMENT)
			reconcileChildrenArray(wipFiber, wipFiber.props.children);
	} catch (error) {
		catchError(error, wipFiber);
	}
}

function updateFunctionComponent(wipFiber: IFiber) {
	const newChildElements = (wipFiber.type as FunctionComponent)(wipFiber.props);
	reconcileChildrenArray(wipFiber, newChildElements);
}

function updateClassComponent(wipFiber: IFiber) {
	let instance: Component = wipFiber.stateNode as Component;
	if (!instance) {
		instance = wipFiber.stateNode = createInstance(wipFiber);
	}
	const Ctor = wipFiber.type as ClassComponent;
	let nextState = Object.assign({}, instance.state, wipFiber.partialState);
	const nextContext = Ctor.contextType?.currentValue;
	if (!instance.shouldComponentUpdate(wipFiber.props, nextState, nextContext)) {
		return cloneChildren(wipFiber);
	}

	if (Ctor.getDerivedStateFromProps) {
		nextState = Ctor.getDerivedStateFromProps(wipFiber.props, nextState);
	}

	const prevState = instance.state;
	const prevProps = instance.props;

	instance.context = nextContext;
	instance.props = wipFiber.props;
	instance.state = nextState;
	wipFiber.partialState = null;

	const oldFiber = wipFiber.alternate;

	reconcileChildrenArray(wipFiber, instance.render());
	if (instance.getSnapshotBeforeUpdate && oldFiber) {
		instance._snapshot = instance.getSnapshotBeforeUpdate(
			prevProps,
			prevState!
		);
	}
}

function updateHostComponent(wipFiber: IFiber) {
	if (!wipFiber.stateNode) {
		wipFiber.stateNode = createDomElement(wipFiber) as Element;
	}
	const newChildElements = wipFiber.props.children;
	reconcileChildrenArray(wipFiber, newChildElements);
}

function cloneChildren(wipFiber: IFiber) {
	const oldFiber = wipFiber.alternate!;
	if (!oldFiber.child) return;
	let oldChild: IFiber | null | undefined = oldFiber.child;
	let prevChild: IFiber | null = null;
	for (let i = 0; oldChild; i++, oldChild = oldChild.sibling) {
		const newChild = cloneFiber(oldChild, wipFiber, i);
		if (prevChild) prevChild.sibling = newChild;
		else wipFiber.child = newChild;
		prevChild = newChild;
	}
}

function reconcileChildrenArray(wipFiber: IFiber, newChildElements: any) {
	const elements = arrify(newChildElements) as IVNode[];
	let oldFiber = wipFiber.alternate ? wipFiber.alternate.child : null;
	let newFiber: IFiber | null | undefined = null;
	const map = new Map<any, IFiber>();
	for (let node = oldFiber, i = 0; node; node = node.sibling, i++) {
		const key = node.props.key || node.index;
		map.set(key, node);
	}

	for (let index = 0; index < elements.length; index++) {
		const prevFiber = newFiber;
		const element = elements[index];
		const key = element ? element.props.key || index : null;
		const oldFiber = map.get(key);
		if (oldFiber && oldFiber.type === element.type) {
			newFiber = cloneFiber(oldFiber, wipFiber, index, element.props);
			map.delete(key);
		} else {
			newFiber = createFiber(element, wipFiber, index);
		}
		if (index === 0) {
			wipFiber.child = newFiber;
		} else if (prevFiber) prevFiber.sibling = newFiber;
	}

	for (const node of map.values()) deleteChild(node, wipFiber);

	map.clear();
}

function deleteChild(fiber: IFiber, parent?: IFiber | null) {
	fiber.effectTag |= Effect.DELETION;
	parent = parent || fiber.parent;
	if (parent) {
		parent.effects = parent.effects || [];
		parent.effects.push(fiber);
	}
}

function completeWork(fiber: IFiber) {
	if (fiber.parent) {
		const childEffects = fiber.effects || [];
		const thisEffect = fiber.effectTag ? [fiber] : [];
		const parentEffects = fiber.parent.effects || [];
		fiber.parent.effects = parentEffects.concat(childEffects, thisEffect);
	} else {
		pendingCommit = fiber;
	}
}

function commitAllWork(fiber: IFiber) {
	(fiber.effects || []).forEach((f) => {
		try {
			commitWork(f);
		} catch (error) {
			catchError(error, fiber);
		}
	});

	(fiber.stateNode as any)._rootContainerFiber = fiber;

	nextUnitOfWork = null;
	pendingCommit = null;
}

function commitWork(fiber: IFiber) {
	if (fiber.tag === ITag.HOST_ROOT || !fiber.effectTag) return;

	if (fiber.effectTag & Effect.PLACEMENT) commitPlacement(fiber);

	if (fiber.effectTag & Effect.UPDATE) commitUpdate(fiber);

	if (fiber.effectTag & Effect.DELETION) commitDeletion(fiber);
}

function getHostParent(fiber: IFiber): HTMLElement {
	let domParentFiber = fiber.parent;
	if (!domParentFiber) return fiber.stateNode as HTMLElement;
	while (
		domParentFiber.tag === ITag.FUNCTION_COMPONENT ||
		domParentFiber.tag === ITag.CLASS_COMPONENT ||
		domParentFiber.tag === ITag.FRAGMENT
	) {
		domParentFiber = domParentFiber.parent!;
	}
	return domParentFiber.stateNode as HTMLElement;
}

function getHostSibling(fiber: IFiber): Element | null {
	let node: IFiber = fiber;
	siblings: while (true) {
		while (!node.sibling) {
			if (!node.parent || node.parent.tag === ITag.HOST_COMPONENT) return null;
			node = node.parent;
		}
		node.sibling.parent = node.parent;
		node = node.sibling;

		while (node.tag !== ITag.HOST_COMPONENT && node.tag !== ITag.HOST_TEXT) {
			if (node.effectTag & Effect.PLACEMENT || !node.child) continue siblings;
			node.child.parent = node;
			node = node.child;
		}

		if (!(node.effectTag & Effect.PLACEMENT)) {
			return node.stateNode as Element;
		}
	}
}

function commitPlacement(fiber: IFiber) {
	const domParent = getHostParent(fiber);
	if (fiber.tag === ITag.HOST_COMPONENT || fiber.tag === ITag.HOST_TEXT) {
		const before = getHostSibling(fiber);
		const node = fiber.stateNode as Element;
		domMap.set(node as HTMLElement, fiber);
		if (before) domParent.insertBefore(node, before);
		else domParent.appendChild(node);
		if (fiber.props.ref) fiber.props.ref.current = fiber.stateNode;
	} else if (fiber.tag === ITag.CLASS_COMPONENT) {
		(fiber.stateNode as Component).componentDidMount();
	} else if (fiber.tag === ITag.FUNCTION_COMPONENT) {
		let { effects, layoutEffects, destroy } = fiber.hooks;
		if (!destroy) fiber.hooks.destroy = destroy = [];
		effects?.values.forEach(async ({ callback, canRun }) => {
			if (canRun) {
				const unMount = await wait(callback, 17)();
				if (unMount) destroy!.push(unMount);
			}
		});
		layoutEffects?.values.forEach(({ callback, canRun }) => {
			if (canRun) {
				const unMount = callback();
				if (unMount) destroy!.push(unMount);
			}
		});
	}
	fiber.effectTag! &= ~Effect.PLACEMENT;
}

function commitUpdate(fiber: IFiber) {
	if (fiber.tag === ITag.HOST_COMPONENT) {
		updateDomProperties(
			fiber.stateNode as HTMLElement,
			(fiber.alternate as IFiber).props,
			fiber.props
		);
	} else if (fiber.tag === ITag.FUNCTION_COMPONENT) {
		const { effects, layoutEffects } = fiber.hooks;
		effects?.values.forEach(async ({ callback, canRun }) => {
			if (canRun) await wait(callback, 17)();
		});
		layoutEffects?.values.forEach(({ callback, canRun }) => {
			if (canRun) callback();
		});
	} else if (
		fiber.tag === ITag.CLASS_COMPONENT &&
		fiber.stateNode instanceof Component
	) {
		const oldFiber = fiber.alternate;
		if (oldFiber) {
			fiber.stateNode.componentDidUpdate(
				oldFiber.props,
				(oldFiber.stateNode as Component).state!
			);
		}
	}
	fiber.effectTag! &= ~Effect.UPDATE;
}

function commitDeletion(fiber: IFiber) {
	let node: IFiber | null | undefined = fiber;
	const domParent = getHostParent(fiber);
	while (true) {
		if (node?.tag === ITag.FUNCTION_COMPONENT || node?.tag === ITag.FRAGMENT) {
			node = node?.child;
			continue;
		}
		domParent.removeChild(node?.stateNode as Element);
		while (node !== fiber && !node?.sibling) node = node?.parent;
		if (node === fiber) break;
		node = node.sibling;
	}

	const goStep = (node: IFiber): IFiber | undefined => {
		if (node.child) return node.child;
		let cursor: IFiber | null | undefined = node;
		while (cursor && cursor != fiber) {
			try {
				if (cursor.hooks.destroy) cursor.hooks.destroy.forEach((f) => f());
				if (cursor.stateNode instanceof Component) cursor.stateNode.destory();
			} catch (error) {
				catchError(error, cursor);
			}
			if (cursor.sibling) return cursor.sibling;
			cursor = cursor.parent;
		}
	};
	while (node) node = goStep(node);
	fiber.effectTag! &= ~Effect.DELETION;
}
