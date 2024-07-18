import { Component } from '../component';
import { ComponentChildren, ComponentType, Key, Ref, VNode } from './vdom';
export * from './vdom';
export * from './enums';

export enum ITag {
	HOST_COMPONENT = 'Host',
	HOST_TEXT = 'HostText',
	CLASS_COMPONENT = 'Class',
	FUNCTION_COMPONENT = 'Function',
	HOST_ROOT = 'Root',
	FRAGMENT = 'Fragment',
	SUSPENSE = 'Suspense',
	OFFSCREEN = 'Offscreen',
	CONTEXT_PROVIDER = 'ContextProvider',
	UNKNOWN = 'Unknown'
}

export enum Effect {
	NOTHING = 0,
	PLACEMENT = 1,
	DELETION = 2,
	UPDATE = 4
}

export enum Flags {
	NONE = 0,
	ShouldCapture = 1,
	DidCapture = 2
}

export interface IdleDeadline {
	didTimeout: boolean;
	timeRemaining(): number;
}

export interface Attributes {
	key?: Key | undefined;
	jsx?: boolean | undefined;
}

export interface ClassAttributes<T> extends Attributes {
	ref?: Ref<T>;
}

export interface SrenderDOMAttributes {
	children?: ComponentChildren;
	dangerouslySetInnerHTML?: {
		__html: string;
	};
}

export type IdleRequestCallback = (deadline: IdleDeadline) => any;

export interface SuspenseProps {
	children?: VNode;
	fallback?: NonNullable<VNode> | null;
}

export interface ExoticComponent<P = {}> {
	(props: P): VNode;
	readonly $$typeof: symbol;
}

export interface IState {
	[key: string]: any;
}

export interface IProps {
	children?: ComponentChildren;
	style?: object;
	[key: string]: any;
}

export interface IFiber {
	tag: ITag;
	type?: ComponentType;
	lanes?: number;

	flags: Flags;

	$$typeof: Symbol;
	index: number;

	parent?: IFiber | null;
	child?: IFiber | null;
	sibling?: IFiber | null;
	alternate?: IFiber | null;

	stateNode?: Element | Component;

	hooks: {
		refs?: {
			index: number;
			values: Ref[];
		};
		states?: {
			index: number;
			values: any[];
		};
		layoutEffects?: {
			index: number;
			values: { callback: () => void | (() => void); canRun: boolean }[];
		};
		effects?: {
			index: number;
			values: { callback: () => void | (() => void); canRun: boolean }[];
		};
		destroy?: (() => void)[];
	};

	props: IProps;
	partialState?: IState | null;
	effectTag: Effect;
	effects?: IFiber[];
}

export interface IUpdate {
	from: ITag;
	dom?: HTMLElement;
	newProps?: IProps;
	partialState?: IState | null;
	fiber?: IFiber;
}
