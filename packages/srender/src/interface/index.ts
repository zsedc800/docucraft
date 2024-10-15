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
	ref?: Ref<T | undefined>;
}

export interface SrenderDOMAttributes {
	children?: ComponentChildren;
	dangerouslySetInnerHTML?: {
		__html: string;
	};
}

export type IdleRequestCallback = (deadline: IdleDeadline) => any;

export interface SuspenseProps {
	children?: VNode | VNode[];
	fallback?: NonNullable<VNode> | null;
}

export interface ExoticComponent<P = {}> {
	(props: P): VNode;
	readonly $$typeof: symbol;
}

export interface NamedExoticComponent<P = {}> extends ExoticComponent<P> {
	displayName?: string | undefined;
}

export interface ForwardRefExoticComponent<P> extends NamedExoticComponent<P> {
	defaultProps?: Partial<P>;
}

export interface IState {
	[key: string]: any;
}

export interface IProps {
	children?: ComponentChildren;
	style?: object;
	[key: string]: any;
}
