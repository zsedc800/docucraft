import { TEXT_ELEMENT } from './element';
import { Fiber, IProps, IState } from './interface';
const blacklist = ['children', 'style', 'ref'];
const isEvent = (name: string) => name.startsWith('on');
const isAttribute = (name: string) =>
	!(isEvent(name) || blacklist.includes(name));
// !isEvent(name) && name !== 'children' && name !== 'style';
const isNew = (prev: IState, next: IState) => (key: string) =>
	prev[key] !== next[key];
const isGone = (next: IState) => (key: string) => !(key in next);
function convertName(name: string) {
	return name === 'className' ? 'class' : name;
}

const svgElements = new Set([
	'svg',
	'circle',
	'rect',
	'path',
	'line',
	'polygon',
	'polyline',
	'ellipse',
	'g',
	'text',
	'tspan',
	'defs',
	'linearGradient',
	'radialGradient',
	'stop',
	'use'
]);
const booleanAttributes = new Set([
	'disabled',
	'checked',
	'readonly',
	'selected',
	'multiple',
	'hidden',
	'autofocus',
	'required'
]);
export function updateDomProperties(
	dom: HTMLElement,
	prevProps: IProps,
	nextProps: IProps
) {
	Object.keys(prevProps)
		.filter(isAttribute)
		.filter(isGone(nextProps))
		.forEach((name) => {
			// (dom as IState)[name] = null;
			dom.removeAttribute(convertName(name));
		});

	Object.keys(nextProps)
		.filter(isAttribute)
		.filter(isNew(prevProps, nextProps))
		.forEach((name) => {
			const value = nextProps[name];
			if (dom.nodeType === Node.TEXT_NODE) {
				(dom as IState)[name] = value;
			} else if (
				svgElements.has(dom.tagName.toLowerCase()) &&
				name !== 'xmlns'
			) {
				// const svgPropName = name.replace(/(a-z)(A-Z)/g, '$1-$2').toLowerCase();
				dom.setAttributeNS(null, convertName(name), value);
			} else if (booleanAttributes.has(name)) {
				if (value) dom.setAttribute(name, 'true');
				else dom.removeAttribute(name);
			} else {
				dom.setAttribute(convertName(name), value);
			}
		});

	prevProps.style = prevProps.style || {};
	nextProps.style = nextProps.style || {};

	Object.keys(nextProps.style)
		.filter(isNew(prevProps.style, nextProps.style))
		.forEach((key) => {
			const val = (nextProps as any).style[key];
			dom.style.setProperty(key, val);
		});

	Object.keys(prevProps.style)
		.filter(isGone(nextProps.style))
		.forEach((key) => {
			dom.style.setProperty(key, null);
		});
}

export function createDomElement(fiber: Fiber) {
	const type = fiber.type as string;
	const isTextElement = fiber.type === TEXT_ELEMENT;
	const dom =
		fiber.type === 'svg' || svgElements.has(type)
			? document.createElementNS(
					fiber.pendingProps.xmlns || 'http://www.w3.org/2000/svg',
					type
				)
			: isTextElement
				? document.createTextNode('')
				: document.createElement(fiber.type as string);
	updateDomProperties(dom as HTMLElement, {}, fiber.pendingProps);
	return dom;
}
