export enum ITag {
	HOST_COMPONENT = 'host',
	HOST_TEXT = 'host_text',
	CLASS_COMPONENT = 'class',
	FUNCTION_COMPONENT = 'function',
	HOST_ROOT = 'root',
	FRAGMENT = 'fragment',
	UNKNOWN = 'unknown'
}

export interface Ref<T = any> {
	current: T;
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

export type FunctionComponent = <T = Record<any, any>>(
	props: T
) => IVNode | IVNode[] | null | ((props: any) => JSX.Element);

export type ComponentType = string | FunctionComponent;

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

	stateNode?: Element;
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
