import { Node } from 'prosemirror-model';
import crel, { updateElement } from '../../createElement';
import ReactDOM from 'react-dom/client';
import {
  Decoration,
  DecorationSource,
  EditorView,
  NodeView,
  NodeViewConstructor,
} from 'prosemirror-view';
import { setup } from './menu';
type GetPos = () => number | undefined;
export class CodeBlockView implements NodeView {
  name = 'blockCode';
  view: EditorView;
  getPos: GetPos;
  unmount?: () => void;
  dom!: HTMLElement;
  menu: HTMLElement;
  node: Node;
  root: ReactDOM.Root;
  contentDOM?: HTMLElement | null | undefined;
  constructor(...args: Parameters<NodeViewConstructor>) {
    const [node, view, getPos] = args;
    this.node = node;
    this.view = view;
    this.getPos = getPos;
    this.contentDOM = crel('code', {
      class: 'scrollbar',
      'data-language': node.attrs.language,
      'data-theme': node.attrs.theme,
      'data-show-line-number': node.attrs.showLineNumber,
      'data-node-type': 'codeBlock',
    });
    this.menu = crel('div', { class: 'code-block-menu-container' });
    this.dom = crel('pre', {
      class: 'docucraft-codeblock hljs',
      'data-language': node.attrs.language,
      'data-theme': node.attrs.theme,
      'data-show-line-number': node.attrs.showLineNumber,
      'data-node-type': 'codeBlock',
    });
    this.root = ReactDOM.createRoot(this.menu);
    this.dom.appendChild(this.menu);
    this.dom.appendChild(this.contentDOM);
    this.renderComponent();
  }

  renderComponent() {
    setup(this);
  }

  update(
    node: Node,
    decorations: readonly Decoration[],
    innerDecorations: DecorationSource
  ) {
    if (node.type !== this.node.type) return false;
    this.node = node;
    updateElement(this.dom, {
      'data-language': node.attrs.language,
      'data-theme': node.attrs.theme,
      'data-show-line-number': node.attrs.showLineNumber,
    });
    updateElement(this.contentDOM as HTMLElement, {
      'data-language': node.attrs.language,
      'data-theme': node.attrs.theme,
      'data-show-line-number': node.attrs.showLineNumber,
    });

    this.renderComponent();

    return true;
  }

  destroy() {
    this.root.unmount();
  }
}

export const CodeBlockViewConstructor: NodeViewConstructor = (...args) =>
  new CodeBlockView(...args);
