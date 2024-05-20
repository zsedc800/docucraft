interface Spec {
    [key: string]: string | boolean | string | ((e: Event) => void);
}
declare function createElement(tag: string, options: Spec, ...children: (HTMLElement | string)[]): HTMLElement;
export default createElement;
