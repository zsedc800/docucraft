import { TEXT_ELEMENT, getTag } from './element';
import { initHooks } from './hooks';
import { Effect, IFiber, IProps, IState, IVNode } from './interface';

const isEvent = (name: string) => name.startsWith('on');
const isAttribute = (name: string) =>
	!isEvent(name) && name !== 'children' && name !== 'style';
const isNew = (prev: IState, next: IState) => (key: string) =>
	prev[key] !== next[key];
const isGone = (next: IState) => (key: string) => !(key in next);

export function updateDomProperties(
	dom: HTMLElement,
	prevProps: IProps,
	nextProps: IProps
) {
	Object.keys(prevProps)
		.filter(isAttribute)
		.filter(isGone(nextProps))
		.forEach((name) => {
			(dom as IState)[name] = null;
			// dom.removeAttribute(name);
		});

	Object.keys(nextProps)
		.filter(isAttribute)
		.filter(isNew(prevProps, nextProps))
		.forEach((name) => {
			// console.log(dom, dom.setAttribute, 'dom.');

			(dom as IState)[name] = nextProps[name];
			// dom.setAttribute(name, nextProps[name]);
		});

	prevProps.style = prevProps.style || {};
	nextProps.style = nextProps.style || {};

	Object.keys(nextProps.style)
		.filter(isNew(prevProps.style, nextProps.style))
		.forEach((key) => {
			dom.style[key as any] = (nextProps as any).style[key];
		});

	Object.keys(prevProps.style)
		.filter(isGone(nextProps.style))
		.forEach((key) => {
			dom.style[key as any] = '';
		});
}

export function createDomElement(fiber: IFiber) {
	const isTextElement = fiber.type === TEXT_ELEMENT;
	const dom = isTextElement
		? document.createTextNode('')
		: document.createElement(fiber.type as string);
	updateDomProperties(dom as HTMLElement, [], fiber.props);
	return dom;
}

export function cloneFiber(
	oldFiber: IFiber,
	parent: IFiber | null | undefined,
	index: number,
	props?: IProps
): IFiber {
	if (!props) props = oldFiber.props;
	return {
		type: oldFiber.type,
		tag: oldFiber.tag,
		stateNode: oldFiber.stateNode,
		hooks: initHooks(oldFiber!),
		index,
		parent: parent,
		alternate: oldFiber,
		$$typeof: oldFiber.$$typeof,
		props,
		partialState: oldFiber.partialState,
		effectTag: Effect.UPDATE
	};
}
export function createFiber(
	element: IVNode,
	parent: IFiber | null | undefined,
	index: number
) {
	return {
		type: element.type,
		$$typeof: element.$$typeof,
		tag: getTag(element),
		props: element.props,
		hooks: initHooks(),
		parent,
		index,
		effectTag: Effect.PLACEMENT
	};
}
