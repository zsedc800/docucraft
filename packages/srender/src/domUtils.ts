import { TEXT_ELEMENT } from './element';
import { Fiber, IProps, IState } from './interface';

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

export function createDomElement(fiber: Fiber) {
	const isTextElement = fiber.type === TEXT_ELEMENT;
	const dom = isTextElement
		? document.createTextNode('')
		: document.createElement(fiber.type as string);
	updateDomProperties(dom as HTMLElement, [], fiber.pendingProps);
	return dom;
}
