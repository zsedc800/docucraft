interface Spec {
  [key: string]: undefined | null | boolean | string | ((e: Event) => void);
}
type DOMNode = HTMLElement | string;
type TagName = keyof HTMLElementTagNameMap;

function createElement<T extends TagName>(
  tag: T,
  options: Spec = {},
  arg?: DOMNode | DOMNode[],
  ...rest: DOMNode[]
): HTMLElementTagNameMap[T] {
  let children: DOMNode[] = [];
  if (Array.isArray(arg)) children = arg;
  else children = arg ? [arg, ...rest] : [];

  const dom = document.createElement(tag);
  for (const key of Object.keys(options)) {
    const val = options[key];
    if (val === null || val === undefined) continue;
    if (typeof val === 'function') {
      dom.addEventListener(key.replace('on', ''), val);
    } else {
      dom.setAttribute(key, val + '');
    }
  }
  const fragment = document.createDocumentFragment();
  for (const child of children) {
    fragment.append(child);
  }
  dom.appendChild(fragment);
  return dom;
}

export default createElement;

export const updateElement = (
  dom: HTMLElement,
  attrs: Record<string, string>
) => {
  for (const key of Object.keys(attrs)) {
    dom.setAttribute(key, attrs[key]);
  }
};
