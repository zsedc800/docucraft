interface Spec {
    [key: string]: undefined | null | boolean | string | ((e: Event) => void);
}
type DOMNode = HTMLElement | string;
type TagName = keyof HTMLElementTagNameMap;
declare function createElement<T extends TagName>(tag: T, options?: Spec, arg?: DOMNode | DOMNode[], ...rest: DOMNode[]): HTMLElementTagNameMap[T];
export default createElement;
export declare const updateElement: (dom: HTMLElement, attrs: Record<string, string>) => void;
