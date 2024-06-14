import {
	cloneFiber,
	createDomElement,
	createFiber,
	updateDomProperties
} from './domUtils';
import { ELEMENT, FRAGMENT, getTag, TEXT_ELEMENT } from './element';
import { domMap, registerEvent } from './events';
import { initHooks, setCurrentFiber } from './hooks';

import {
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
const cacheMap = new Map<any, Element>();

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
	if (!(containerDom as any)._rootContainerFiber) registerEvent(containerDom);
	if (sync)
		performWork({ timeRemaining: () => 1000 as any, didTimeout: false });
	else requestIdleCallback(performWork);

	return containerDom;
}

export function unMountComponentsAtNode(dom: HTMLElement) {
	const rootFiber: IFiber = (dom as any)._rootContainerFiber;
	const fiber = rootFiber ? rootFiber.child : void 0;
	if (fiber) commitDeletion(fiber, dom);
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

		stateNode: update.dom || root.stateNode,

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
	switch (wipFiber.tag) {
		case ITag.FUNCTION_COMPONENT:
			updateFunctionComponent(wipFiber);
			break;
		case ITag.HOST_ROOT:
		case ITag.HOST_COMPONENT:
			updateHostComponent(wipFiber);
			break;
	}
	if (wipFiber.$$typeof === FRAGMENT)
		reconcileChildrenArray(wipFiber, wipFiber.props.children);
}

function updateFunctionComponent(wipFiber: IFiber) {
	const newChildElements = (wipFiber.type as FunctionComponent)(wipFiber.props);
	reconcileChildrenArray(wipFiber, newChildElements);
}

function updateHostComponent(wipFiber: IFiber) {
	if (!wipFiber.stateNode) {
		wipFiber.stateNode = createDomElement(wipFiber) as Element;
	}

	const newChildElements = wipFiber.props.children;
	reconcileChildrenArray(wipFiber, newChildElements);
}

function arrify(val: any) {
	return val == null ? [] : Array.isArray(val) ? val : [val];
}

function reconcileChildrenArray(wipFiber: IFiber, newChildElements: any) {
	const elements = arrify(newChildElements) as IVNode[];

	let index = 0;
	let oldFiber = wipFiber.alternate ? wipFiber.alternate.child : null;
	let newFiber: IFiber | null | undefined = null;
	let isList = true;
	const oldList: IFiber[] = [];
	const map = new Map<any, { node: IFiber; index: number }>();
	for (let node = oldFiber, i = 0; node; node = node.sibling, i++) {
		oldList.push(node);
		const key = node.props.key || i;
		map.set(key, { node, index: i });
		// if (!key) {
		// 	isList = false;
		// 	break;
		// }
	}
	if (isList) {
		wipFiber.effects = wipFiber.effects || [];
		while (index < elements.length) {
			const preFiber = newFiber;
			const element = elements[index];
			const key = element.props.key || index;
			const val = map.get(key);
			if (val) {
				const { node: oldFiber, index: i } = val;
				if (oldFiber.type === element.type) {
					newFiber = cloneFiber(oldFiber, wipFiber, element.props);
					if (index !== i) newFiber.effectTag! |= Effect.MOVE;
				} else {
					newFiber = createFiber(element, wipFiber);
					oldFiber.effectTag = Effect.DELETION;
					wipFiber.effects.push(oldFiber);
				}
				newFiber.place = {
					to: index,
					from: i
				};
				map.delete(key);
			} else {
				newFiber = createFiber(element, wipFiber);
				// newFiber.place = { from: -1, to: index };
			}

			if (index === 0) wipFiber.child = newFiber;
			else if (preFiber) preFiber.sibling = newFiber;
			index++;
		}

		for (const { node } of map.values()) {
			node.effectTag = Effect.DELETION;
			wipFiber.effects.push(node);
		}
	} else
		while (index < elements.length || oldFiber) {
			const prevFiber = newFiber;
			const element = index < elements.length && elements[index];
			const sameType = oldFiber && element && element.type === oldFiber.type;

			if (sameType) newFiber = cloneFiber(oldFiber!, wipFiber, element.props);
			else {
				if (element) {
					newFiber = createFiber(element, wipFiber);
					newFiber.place = { from: -1, to: index };
				}

				if (oldFiber) {
					oldFiber.effectTag = Effect.DELETION;
					wipFiber.effects = wipFiber.effects || [];
					wipFiber.effects.push(oldFiber);
				}
			}

			if (oldFiber) oldFiber = oldFiber.sibling;

			if (index === 0) wipFiber.child = newFiber;
			else if (prevFiber && element) prevFiber.sibling = newFiber;

			index++;
		}
}

function completeWork(fiber: IFiber) {
	if (fiber.parent) {
		const childEffects = fiber.effects || [];
		const thisEffect = fiber.effectTag != null ? [fiber] : [];
		const parentEffects = fiber.parent.effects || [];
		fiber.parent.effects = parentEffects.concat(childEffects, thisEffect);
	} else {
		pendingCommit = fiber;
	}
}

function commitAllWork(fiber: IFiber) {
	(fiber.effects || []).forEach((f) => commitWork(f));

	(fiber.stateNode as any)._rootContainerFiber = fiber;

	nextUnitOfWork = null;
	pendingCommit = null;
}

function commitWork(fiber: IFiber) {
	if (fiber.tag === ITag.HOST_ROOT || !fiber.effectTag) return;

	let domParentFiber: IFiber = fiber.parent!;
	while (
		domParentFiber.tag === ITag.FUNCTION_COMPONENT ||
		domParentFiber.tag === ITag.UNKNOWN
	) {
		domParentFiber = domParentFiber.parent!;
	}
	const domParent = domParentFiber.stateNode as Element;
	if (fiber.effectTag & Effect.PLACEMENT) commitPlacement(fiber, domParent);

	if (fiber.effectTag & Effect.UPDATE) commitUpdate(fiber);

	if (fiber.effectTag & Effect.DELETION) commitDeletion(fiber, domParent);

	if (fiber.effectTag & Effect.MOVE) commitMove(fiber, domParent);
}

function commitMove(fiber: IFiber, domParent: Element) {
	const { to } = fiber.place!;
	const node = fiber.stateNode as Element;
	domParent.removeChild(node);
	const before = domParent.children[to];
	before ? domParent.insertBefore(node, before) : domParent.appendChild(node);
}

function commitPlacement(fiber: IFiber, domParent: Element) {
	if (fiber.tag === ITag.HOST_COMPONENT) {
		if (fiber.place) {
			const { to } = fiber.place;
			const before = domParent.children[to];
			before
				? domParent.insertBefore(fiber.stateNode as Element, before)
				: domParent.appendChild(fiber.stateNode as Element);
		} else domParent.appendChild(fiber.stateNode as Element);
		domMap.set(fiber.stateNode as HTMLElement, fiber);
		if (fiber.props.ref) fiber.props.ref.current = fiber.stateNode;
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
	}
}

function commitDeletion(fiber: IFiber, domParent: Element) {
	let node: IFiber | null | undefined = fiber;
	while (true) {
		if (node?.tag === ITag.FUNCTION_COMPONENT || node?.$$typeof === FRAGMENT) {
			node = node?.child;
			continue;
		}
		domParent.removeChild(node?.stateNode!);
		while (node !== fiber && !node?.sibling) node = node?.parent;
		if (node === fiber) break;
		node = node.sibling;
	}

	const goStep = (node: IFiber): IFiber | undefined => {
		if (node.child) return node.child;
		let cursor: IFiber | null | undefined = node;
		while (cursor && cursor != fiber) {
			if (cursor.hooks.destroy) cursor.hooks.destroy.forEach((f) => f());
			if (cursor.sibling) return cursor.sibling;
			cursor = cursor.parent;
		}
	};
	while (node) node = goStep(node);
}
