import { Component } from './component';
import {
	ClassComponent,
	ComponentChild,
	ComponentChildren,
	ComponentType,
	FiberTag,
	FunctionComponent,
	IProps,
	ITag,
	IVNode,
	VNode
} from './interface';
import { isSubclassOf } from './utils';

export const TEXT_ELEMENT = 'TEXT_ELEMENT';
export const FRAGMENT = Symbol.for('srender.Fragment');
export const ELEMENT = Symbol.for('srender.Element');
export const SUSPENSE = Symbol.for('srender.Suspense');

export const OFFSCREEN = Symbol.for('srender.Offscreen');
export const ContextProvider = Symbol.for('srender.ContextProvider');

export const getTag = ({ type, $$typeof }: IVNode) => {
	switch ($$typeof) {
		case FRAGMENT:
			return FiberTag.Fragment;
		case SUSPENSE:
			return FiberTag.Suspense;
		case OFFSCREEN:
			return FiberTag.Offscreen;
		case ContextProvider:
			return FiberTag.ContextProvider;
	}
	if (typeof type === 'string')
		return type === TEXT_ELEMENT ? FiberTag.HostText : FiberTag.HostComponent;
	if (typeof type === 'function')
		return isSubclassOf(type, Component)
			? FiberTag.ClassComponent
			: FiberTag.FunctionComponent;

	return FiberTag.Unknown;
};

export function createElement(
	type: ComponentType,
	config: Record<any, any> | null = {},
	...args: any[]
): IVNode {
	let children: any[] = [];

	if (typeof config !== 'object' || config?.$$typeof) {
		children = [config, ...args];
		config = {};
	} else if (Array.isArray(config)) {
		children = config;
		config = {};
	} else if (Array.isArray(args[0])) {
		children = args[0];
	} else if (config?.children) {
		config.key = config.key ? config.key : args[0] || void 0;
	} else {
		children = [...args];
	}
	if (config && (config.children || config.children === 0))
		children = children.concat(config.children);
	const props: IProps = Object.assign({ children: null }, config);

	// if (props.className) props.class = props.className;
	props.children = children
		.filter((c) => c != undefined && c != null && c !== false)
		.map((c: any) => (c?.$$typeof ? c : createTextElement(c)));

	let node: IVNode = {
		$$typeof: ELEMENT,
		props,
		type
	};
	if (typeof type === 'symbol') node.$$typeof = type;
	if (
		typeof type === 'function' &&
		(type as FunctionComponent).displayType === ContextProvider
	)
		node.$$typeof = ContextProvider;

	return node;
}

export function arrify(val: any) {
	return val == null ? [] : Array.isArray(val) ? val : [val];
}

function createTextElement(value: string): IVNode {
	return createElement(TEXT_ELEMENT, { nodeValue: value });
}

export function cloneElement(element: VNode, props: any) {
	return Object.assign({}, element, { props: { ...element.props, ...props } });
}

export const forEach = (
	children: ComponentChildren,
	callback: (child: ComponentChild, index: number) => void
) => {
	children = arrify(children);
	for (let i = 0; i < children.length; i++) {
		callback(children[i], i);
	}
};

export const map = (
	children: ComponentChildren,
	callback: (child: ComponentChild, index: number) => ComponentChild
) => {
	children = arrify(children);
	const newChildren = [];
	for (let i = 0; i < children.length; i++) {
		newChildren.push(callback(children[i], i));
	}
	return newChildren;
};

export const only = <C>(children: C): C extends any[] ? never : C => {
	return Array.isArray(children) ? children[0] : children;
};

export const isValidElement = (val: any) => {
	if (typeof val !== 'object') return false;
	if (val.$$typeof) return true;
	return false;
};
