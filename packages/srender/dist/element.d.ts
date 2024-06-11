import { ComponentType, ITag, IVNode } from './interface';
export declare const TEXT_ELEMENT = "TEXT ELEMENT";
export declare const getTag: (type: ComponentType) => ITag.HOST_COMPONENT | ITag.CLASS_COMPONENT | ITag.FUNCTION_COMPONENT | ITag.UNKNOWN;
export declare function createElement(type: ComponentType, config?: Record<any, any>, ...args: any[]): IVNode;
