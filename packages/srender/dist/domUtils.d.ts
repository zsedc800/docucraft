import { IFiber, IProps } from './interface';
export declare function updateDomProperties(dom: HTMLElement, prevProps: IProps, nextProps: IProps): void;
/**
 * 创建对应的 DOM 元素，并根据 props 设置相应属性
 * @param fiber 目标 fiber
 */
export declare function createDomElement(fiber: IFiber): HTMLElement | Text;
