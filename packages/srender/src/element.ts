import { Component } from './component';
import { ComponentType, IProps, ITag, IVNode } from './interface';
import { isSubclassOf } from './utils';

export const TEXT_ELEMENT = 'TEXT ELEMENT';

export const getTag = (type: ComponentType) => {
	if (typeof type === 'string') return ITag.HOST_COMPONENT;
	else if (isSubclassOf(type as Function, Component))
		return ITag.CLASS_COMPONENT;
	else if (typeof type === 'function') return ITag.FUNCTION_COMPONENT;
	else return ITag.UNKNOWN;
};

export function createElement(
	type: ComponentType,
	config: Record<any, any> = {},
	...args: any[]
): IVNode {
	const props: IProps = Object.assign({}, config);
	const hasChildren = args.length > 0;
	const rawChildren = hasChildren ? [].concat(...args) : [];
	props.children = rawChildren
		.filter((c) => c != null && c !== false)
		.map((c: any) => (c instanceof Object ? c : createTextElement(c)));
	return { type, props };
}

function createTextElement(value: string): IVNode {
	return createElement(TEXT_ELEMENT, { nodeValue: value });
}
