import { Component } from './component';
import { ITag } from './interface';
import { isSubclassOf } from './utils';
export const TEXT_ELEMENT = 'TEXT ELEMENT';
export const getTag = (type) => {
    if (typeof type === 'string')
        return ITag.HOST_COMPONENT;
    else if (isSubclassOf(type, Component))
        return ITag.CLASS_COMPONENT;
    else if (typeof type === 'function')
        return ITag.FUNCTION_COMPONENT;
    else
        return ITag.UNKNOWN;
};
export function createElement(type, config = {}, ...args) {
    const props = Object.assign({}, config);
    const hasChildren = args.length > 0;
    const rawChildren = hasChildren ? [].concat(...args) : [];
    props.children = rawChildren
        .filter((c) => c != null && c !== false)
        .map((c) => (c instanceof Object ? c : createTextElement(c)));
    return { type, props };
}
function createTextElement(value) {
    return createElement(TEXT_ELEMENT, { nodeValue: value });
}
