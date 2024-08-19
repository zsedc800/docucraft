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

export type ComponentChildren = ComponentChild | ComponentChild[];
export interface BaseProps {
	children: ComponentChildren | ((v: any) => ComponentChildren);
}

export interface Context<T = any> {
	currentValue: T;
	Provider: FunctionComponent<{ value: T } & BaseProps>;
	Consumer: FunctionComponent<{ children: (v: T) => ComponentChildren }>;
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
}

export interface IVNode<P = Props> {
	$$typeof: Symbol;
	type?: ComponentType;
	props: P & {
		children?: ComponentChildren;
	};
}

export type Key = string | number | any;
export interface Ref<T = any> {
	current: T;
}

export type VNode<P = Props> = IVNode<P>;

export type ComponentType<P = {}> =
	| string
	| symbol
	| FunctionComponent<P>
	| ClassComponent<P>;

export interface Update<S = State> {
	lane: Lane;
	tag: UpdateState;
	payload: S | null;
	callback?: (prevState: S, nextProps?: any) => S;
	next: Update<S> | null;
	eventTime: number;
}

export interface SharedQueue<S> {
	pending: Update<S> | null;
}

export interface UpdateQueue<S = State> {
	baseState: S;
	firstBaseUpdate: Update<S> | null;
	lastBaseUpdate: Update<S> | null;
	shared: SharedQueue<S>;
	effects: Array<Update<S>>;
}

export interface Hooks<T = any> {
	state: T;
	baseState: any;
	baseUpdate: Update<any> | null;
	queue: (UpdateQueue<any> & { dispatch?(h: Hooks): void }) | null;
	next: Hooks | null;
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

	ref: Ref | null;

	pendingProps: Props;
	memoizedProps: Props | null;
	updateQueue: UpdateQueue<any> | null;
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
