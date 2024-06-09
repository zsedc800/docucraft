import './style.scss';
export interface Rect {
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
}
export declare class Tooltip {
    static container: HTMLElement;
    static instance?: Tooltip;
    tooltip: HTMLElement;
    visible: boolean;
    constructor();
    content(dom: HTMLElement): void;
    showAt(rect: Rect): void;
    show(target: HTMLElement, content?: string | HTMLElement): void;
    hide(): void;
    destroy(): void;
    static get(): Tooltip;
}
