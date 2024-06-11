import { Component } from './component';
export declare enum ITag {
    HOST_COMPONENT = "host",
    CLASS_COMPONENT = "class",
    FUNCTION_COMPONENT = "function",
    HOST_ROOT = "root",
    UNKNOWN = "unknown"
}
export interface Ref<T = any> {
    current: T;
}
export declare enum Effect {
    PLACEMENT = 1,
    DELETION = 2,
    UPDATE = 3
}
export interface IdleDeadline {
    didTimeout: boolean;
    timeRemaining(): number;
}
export type IdleRequestCallback = (deadline: IdleDeadline) => any;
export type FunctionComponent = <T = Record<any, any>>(props: T) => IVNode | IVNode[] | null;
export type ComponentType = string | Component | FunctionComponent;
export interface IState {
    [key: string]: any;
}
export interface IVNode {
    type: ComponentType;
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
            values: {
                callback: () => void | (() => void);
                canRun: boolean;
            }[];
        };
        effects?: {
            index: number;
            values: {
                callback: () => void | (() => void);
                canRun: boolean;
            }[];
        };
        destroy?: (() => void)[];
    };
    props: IProps;
    partialState?: IState | null;
    effectTag?: Effect;
    effects?: IFiber[];
}
export interface IUpdate {
    from: ITag;
    dom?: HTMLElement;
    instance?: Component;
    newProps?: IProps;
    partialState?: IState | null;
    fiber?: IFiber;
}
