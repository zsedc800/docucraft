interface Spec {
    [key: string]: string | boolean | string | ((e: Event) => void);
}
type DOMNode = HTMLElement | string;
declare function createElement(tag: string, options: Spec, arg?: DOMNode | DOMNode[], ...rest: DOMNode[]): HTMLElement;
export default createElement;
export declare const updateElement: (dom: HTMLElement, attrs: Record<string, string>) => void;
