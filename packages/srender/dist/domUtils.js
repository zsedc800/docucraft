import { TEXT_ELEMENT } from './element';
const isEvent = (name) => name.startsWith('on');
const isAttribute = (name) => !isEvent(name) && name !== 'children' && name !== 'style';
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isGone = (next) => (key) => !(key in next);
export function updateDomProperties(dom, prevProps, nextProps) {
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
        dom[name] = null;
    });
    Object.keys(nextProps)
        .filter(isAttribute)
        .filter(isNew(prevProps, nextProps))
        .forEach((name) => {
        dom[name] = nextProps[name];
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
        dom.style[key] = nextProps.style[key];
    });
    Object.keys(prevProps.style)
        .filter(isGone(nextProps.style))
        .forEach((key) => {
        dom.style[key] = '';
    });
}
/**
 * 创建对应的 DOM 元素，并根据 props 设置相应属性
 * @param fiber 目标 fiber
 */
export function createDomElement(fiber) {
    const isTextElement = fiber.type === TEXT_ELEMENT;
    const dom = isTextElement
        ? document.createTextNode('')
        : document.createElement(fiber.type);
    updateDomProperties(dom, [], fiber.props);
    return dom;
}
