import {
	ComponentChild,
	ComponentChildren,
	ComponentType,
	IProps,
	ITag,
	IVNode
} from './interface';

export const TEXT_ELEMENT = 'TEXT ELEMENT';
export const FRAGMENT = Symbol.for('srender.fragment');
export const ELEMENT = Symbol.for('srender.element');

export const getTag = ({ type, $$typeof }: IVNode) => {
	if (typeof type === 'string')
		return type === TEXT_ELEMENT ? ITag.HOST_TEXT : ITag.HOST_COMPONENT;
	else if (typeof type === 'function') return ITag.FUNCTION_COMPONENT;
	else if ($$typeof === FRAGMENT) return ITag.FRAGMENT;
	else return ITag.UNKNOWN;
};

export function createElement(
	type: ComponentType | typeof FRAGMENT | typeof TEXT_ELEMENT,
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
	} else {
		children = [...args];
	}
	if (config && config.children) children = children.concat(config.children);
	const props: IProps = Object.assign({}, config);

	props.children = children
		.filter((c) => c != undefined && c != null && c !== false)
		.map((c: any) => (c?.$$typeof ? c : createTextElement(c)));

	let node: IVNode = {
		$$typeof: ELEMENT,
		props
	};
	if (type === FRAGMENT) {
		node.$$typeof = FRAGMENT;
	} else {
		node.type = type;
	}
	return node;
}

export function arrify(val: any) {
	return val == null ? [] : Array.isArray(val) ? val : [val];
}

function createTextElement(value: string): IVNode {
	return createElement(TEXT_ELEMENT, { nodeValue: value });
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

export const isValidElement = (val: any) => {
	if (typeof val !== 'object') return false;
	if (val.$$typeof) return true;
	return false;
};
