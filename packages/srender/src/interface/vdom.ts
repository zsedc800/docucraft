import { Lane, Lanes } from '../Lanes';
import { Component } from '../component';
import { Task } from '../scheduler';
import { FiberFlags, FiberTag, Mode, UpdateState } from './enums';

export interface Props {
	[k: string]: any;
}

export interface State {
	[k: string]: any;
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

export type ReactNode = ComponentChild;

export type ComponentChildren = ComponentChild | ComponentChild[];
export interface BaseProps {
	children: ComponentChildren | ((v: any) => ComponentChildren);
}

export interface Context<T = any> {
	currentValue: T;
	Provider: FunctionComponent<{ value: T } & BaseProps>;
	Consumer: FunctionComponent<{ children: (v?: T) => ComponentChildren }>;
	pop(): void;
}

export interface FunctionComponent<P = {}> {
	(
		props: P,
		context?: any
	): ComponentChildren | JSX.Element | ((props: any) => JSX.Element);
	displayType?: Symbol;
	displayName?: string;
	defaultProps?: P;
	[k: string]: any;
}

export type FC<P = {}> = FunctionComponent<P>;

export interface ClassComponent<P = Props, S = State, C = any> {
	new (props: P | null, context?: C): Component<P>;
	getDerivedStateFromError?(error: any): S;
	getDerivedStateFromProps?(props: P, state: S): S;
	contextType?: Context<C>;
	defaultProps?: P;
}

export interface VNode<P = Props> {
	$$typeof: Symbol;
	type: ComponentType<P>;
	props: P & {
		children?: ComponentChildren;
	};
	key: string | null;
	ref: Ref<any> | null;
}

export type Key = string | number | any;

export interface RefObject<T = any> {
	current: T;
}

export interface RefCallback<T> {
	(instance: T | null): void;
}

export type Ref<T> = RefCallback<T> | RefObject<T> | null;

export type IVNode<P = Props> = VNode<P>;

export type ComponentType<P = any> =
	| string
	| Symbol
	| FunctionComponent<P>
	| ClassComponent<P>;

export type UpdatePayload<S, P> = S | ((prev: S, props: P) => S) | null;

export interface Update<S = State, P = {}> {
	lane: Lane;
	tag: UpdateState;
	payload: UpdatePayload<S, P>;
	callback?: (prevState: S, nextProps?: any) => S;
	next: Update<S, P> | null;
	eventTime: number;
}

export interface SharedQueue<S, P = {}> {
	pending: Update<S, P> | null;
}

export interface UpdateQueue<S = State, P = {}> {
	baseState: S;
	firstBaseUpdate: Update<S, P> | null;
	lastBaseUpdate: Update<S, P> | null;
	shared: SharedQueue<S, P>;
	effects: Array<Update<S, P>>;
}

export interface Hooks<T = any> {
	state: T;
	baseState: any;
	baseUpdate: Update<any> | null;
	queue: (UpdateQueue<any, any> & { dispatch?(h: Hooks): void }) | null;
	next: Hooks | null;
	fiber: Fiber | null;
}

export interface HookEffect {
	create: () => any;
	destroy?: () => any;
	deps?: any[];
}

export interface Fiber {
	tag: FiberTag;
	key: Key;
	type: ComponentType | null;
	stateNode: RootFiberNode | Element | Component | null;

	callbackNode?: { callback: (...args: any[]) => any; priorityLevel: number };

	mode: Mode;

	lanes: Lanes;
	childLanes: Lanes;

	flags: FiberFlags;

	parent: Fiber | null;
	child: Fiber | null;
	sibling: Fiber | null;
	index: number;

	ref: Ref<any>;

	pendingProps: Props;
	memoizedProps: Props | null;
	updateQueue: (UpdateQueue<any, any> & { onCommit?: () => void }) | null;
	memoizedState: State | Hooks | null;
	alternate: Fiber | null;

	effects: Fiber[] | null;
}

export interface RootFiberNode {
	container: HTMLElement | null;
	current?: Fiber;
	mode: Mode;
	pendingLanes: Lanes;
	renderLanes: Lanes;
	expiredLanes: Lanes;
	finishedWork: Fiber | null;
	callbackNode: Task | null;
	callbackId: Lanes;
}

export interface RootRender {
	render: (children: ComponentChildren, dom?: HTMLElement) => void;
	unmount: () => void;
}
