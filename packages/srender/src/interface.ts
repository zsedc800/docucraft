import { Component } from './component';

export enum ITag {
	HOST_COMPONENT = 'host',
	HOST_TEXT = 'host_text',
	CLASS_COMPONENT = 'class',
	FUNCTION_COMPONENT = 'function',
	HOST_ROOT = 'root',
	FRAGMENT = 'fragment',
	SUSPENSE = 'suspense',
	UNKNOWN = 'unknown'
}

export interface Ref<T = any> {
	current: T;
}

export type ComponentChild =
	| IVNode
	| IVNode[]
	| string
	| null
	| boolean
	| bigint
	| number
	| undefined;

export type ComponentChildren = ComponentChild | ComponentChild[];
export interface BaseProps {
	children: ComponentChildren | ((v: any) => ComponentChildren);
}

export interface Context<T = any> {
	currentValue: T;
	Provider: FunctionComponent<{ value: T } & BaseProps>;
	Consumer: FunctionComponent<{ children: (v: T) => ComponentChildren }>;
}

export enum Effect {
	NOTHING = 0,
	PLACEMENT = 1,
	DELETION = 2,
	UPDATE = 4
}

export interface IdleDeadline {
	didTimeout: boolean;
	timeRemaining(): number;
}

export type IdleRequestCallback = (deadline: IdleDeadline) => any;

export interface FunctionComponent<P = {}> {
	(props: P, context?: any): ComponentChildren | ((props: any) => JSX.Element);
	displayName?: string;
	defaultProps?: Partial<P> | undefined;
}

export interface ClassComponent<P = IProps, S = IState, C = any> {
	new (props: P | null, context?: C): Component<P>;
	getDerivedStateFromError?(error: any): S;
	getDerivedStateFromProps?(props: P, state: S): S;
	contextType?: Context<C>;
}

export type ComponentType<P = {}> =
	| string
	| symbol
	| FunctionComponent<P>
	| ClassComponent<P>;

export interface IState {
	[key: string]: any;
}

export interface IVNode {
	$$typeof: Symbol;
	type?: ComponentType;
	props: {
		children?: IVNode[];
		[key: string]: any;
	};
}

export interface IProps {
	children?: IVNode[];
	style?: object;
	[key: string]: any;
}

export interface IFiber {
	tag: ITag;
	type?: ComponentType;

	$$typeof: Symbol;
	index: number;

	parent?: IFiber | null;
	child?: IFiber | null;
	sibling?: IFiber | null;

	alternate?: IFiber | null;

	stateNode?: Element | Component;
	place?: {
		from: number;
		to: number;
	};
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
