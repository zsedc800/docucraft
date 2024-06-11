import { TEXT_ELEMENT } from './element';
import { IFiber, IProps, IState } from './interface';

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
		.filter(isEvent)
		.filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
		.forEach((name) => {
			const eventType = name.toLowerCase().substring(2);
			dom.removeEventListener(eventType, prevProps[name]);
		});

	Object.keys(prevProps)
		.filter(isAttribute)
		.filter(isGone(nextProps))
		.forEach((name) => {
			(dom as IState)[name] = null;
		});

	Object.keys(nextProps)
		.filter(isAttribute)
		.filter(isNew(prevProps, nextProps))
		.forEach((name) => {
			(dom as IState)[name] = nextProps[name];
		});

	Object.keys(nextProps)
		.filter(isEvent)
		.filter(isNew(prevProps, nextProps))
		.forEach((name) => {
			const eventType = name.toLowerCase().substring(2);
			dom.addEventListener(eventType, nextProps[name]);
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

/**
 * 创建对应的 DOM 元素，并根据 props 设置相应属性
 * @param fiber 目标 fiber
 */
export function createDomElement(fiber: IFiber) {
	const isTextElement = fiber.type === TEXT_ELEMENT;
	const dom = isTextElement
		? document.createTextNode('')
		: document.createElement(fiber.type as string);
	updateDomProperties(dom as HTMLElement, [], fiber.props);
	return dom;
}
