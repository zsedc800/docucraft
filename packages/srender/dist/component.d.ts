import { IFiber, IProps, IState, IVNode } from './interface';
/**
 * @name Component
 * @description 组件基类，定义了构造函数和 setState
 */
export declare class Component {
    props: IProps;
    state?: IState;
    __fiber?: IFiber;
    constructor(props: IProps | null);
    setState(partialState: any): void;
    render(): IVNode | IVNode[] | null | undefined;
}
/**
 * 创建组件实例
 * @param {Fiber} fiber 从fiber创建组件实例
 */
export declare function createInstance(fiber: IFiber): Component;
