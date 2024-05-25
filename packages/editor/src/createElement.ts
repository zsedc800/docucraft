interface Spec {
  [key: string]: string | boolean | string | ((e: Event) => void);
}
type DOMNode = HTMLElement | string;

function createElement(
  tag: string,
  options: Spec,
  arg?: DOMNode | DOMNode[],
  ...rest: DOMNode[]
) {
  let children: DOMNode[] = [];
  if (Array.isArray(arg)) children = arg;
  else children = arg ? [arg, ...rest] : [];

  const dom = document.createElement(tag);
  for (const key of Object.keys(options)) {
    const val = options[key];
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
