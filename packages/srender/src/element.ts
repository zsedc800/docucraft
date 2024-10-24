import { Component } from './component';
import {
	ComponentChildren,
	ComponentType,
	FiberTag,
	FunctionComponent,
	IProps,
	Ref,
	VNode
} from './interface';
import { isSubclassOf } from './utils';

export const TEXT_ELEMENT = 'TEXT_ELEMENT';
export const Fragment = Symbol.for('srender.Fragment');
export const ELEMENT = Symbol.for('srender.Element');
export const Suspense = Symbol.for('srender.Suspense');

export const Offscreen = Symbol.for('srender.Offscreen');
export const ForwardRef = Symbol.for('srender.ForwardRef');
export const Portal = Symbol.for('srender.Portal');
export const ContextProvider = Symbol.for('srender.ContextProvider');

export const getTag = ({ type, $$typeof }: VNode) => {
	switch ($$typeof) {
		case Fragment:
			return FiberTag.Fragment;
		case Suspense:
			return FiberTag.Suspense;
		case Offscreen:
			return FiberTag.Offscreen;
		case ContextProvider:
			return FiberTag.ContextProvider;
		case Portal:
			return FiberTag.Portal;
		case ForwardRef:
			return FiberTag.ForwardRef;
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
): VNode {
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
		.reduce((pre: any[], cur) => pre.concat(cur), [])
		.map((c: any) => {
			if (isValidElement(c) || typeof c === 'function') return c;
			return createTextElement(c);
		});

	props.children =
		props.children.length === 1 ? props.children[0] : props.children;

	let node: VNode = {
		$$typeof: ELEMENT,
		props,
		type,
		key: props.key,
		ref: props.ref
	};
	if (typeof type === 'symbol') node.$$typeof = type;
	if (
		typeof type === 'function' &&
		(type as FunctionComponent).displayType === ContextProvider
	)
		node.$$typeof = ContextProvider;
	if (type && type instanceof ExtendedComponent) {
		node.$$typeof = type.type;
		node.type = node.$$typeof;
		node.props = Object.assign({}, props, type.props);
	}

	return node;
}

export function createPortal(
	children: ComponentChildren,
	container: HTMLElement
) {
	return createElement(Portal, { children, container });
}
export function forwardRef<R, P>(render: (props: P, ref: Ref<R>) => VNode) {
	return new ExtendedComponent(ForwardRef, { render });
}

export class ExtendedComponent {
	constructor(
		public type: Symbol,
		public props: Record<any, any>
	) {}
}

const filter = (e: any) =>
	e !== null && !['undefined', 'boolean'].includes(typeof e);

export function arrify<C = any>(val: C | readonly C[]): C[] {
	return (Array.isArray(val) ? val : [val]).filter(filter);
	// .reduce((pre, cur) => pre.concat(cur), []);
}

function createTextElement(value: string): VNode {
	return createElement(TEXT_ELEMENT, { nodeValue: value });
}

export function cloneElement(element: VNode, props: any) {
	return Object.assign({}, element, { props: { ...element.props, ...props } });
}

export const forEach = <C>(
	children: C | readonly C[],
	callback: (child: C, index: number) => void
) => {
	children = arrify(children);
	for (let i = 0; i < children.length; i++) {
		callback(children[i], i);
	}
};

export const map = <T, C>(
	children: C | readonly C[],
	callback: (child: C, index: number) => T
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

export const count = (children: any) => arrify(children).length;

export const toArray = arrify;

export const isValidElement = (val: any) => {
	if (typeof val !== 'object') return false;
	if (val.$$typeof) return true;
	return false;
};
