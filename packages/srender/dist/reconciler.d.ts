import { Component } from './component';
import { IUpdate } from './interface';
/**
 * 把 virtual DOM tree（可以是数组）渲染到对应的容器 DOM
 * @param elements VNode elements to render
 * @param containerDom container dom element
 */
export declare function render(elements: any, containerDom: HTMLElement): void;
/**
 * 安排更新，通常是由 setState 调用。
 * @param instance 组件实例
 * @param partialState state，通常是对象
 */
export declare function scheduleUpdate(instance: Component, partialState: any): void;
export declare function batchUpdate(update: IUpdate): void;
