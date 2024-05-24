import { Node } from 'prosemirror-model';
import crel from '../../createElement';

import {
  Decoration,
  DecorationSource,
  EditorView,
  NodeView,
  NodeViewConstructor,
} from 'prosemirror-view';
import './style.scss';
import ReactDOM from 'react-dom';
import { setup } from './codeBlock';
type GetPos = () => number | undefined;
export class CodeBlockView implements NodeView {
  name = 'blockCode';
  private view: EditorView;
  private getPos: GetPos;
  unmount?: () => void;
  dom!: HTMLElement;
  node: Node;
  contentDOM?: HTMLElement | null | undefined;
  constructor(...args: Parameters<NodeViewConstructor>) {
    const [node, view, getPos] = args;
    this.node = node;
    this.view = view;
    this.getPos = getPos;
    this.renderUI(node);

    this.renderComponent();
  }

  renderComponent() {
    const { node } = this;
    this.dom = crel('pre', {
      'data-language': node.attrs.language,
      'data-theme': node.attrs.theme,
      'data-show-line-number': node.attrs.showLineNumber,
      'data-node-type': 'codeBlock',
    });
    this.unmount = setup(this.dom, this.node);
  }

  update(
    node: Node,
    decorations: readonly Decoration[],
    innerDecorations: DecorationSource
  ) {
    if (node.type !== this.node.type) return false;
    this.node = node;

    this.renderComponent();

    return true;
  }

  destroy() {
    this.unmount?.();
  }

  private renderUI(node: Node) {
    // pre-wrapper

    // code-meanu
    const menuContainer = crel(
      'div',
      {
        class: 'code-block-menu-container',
      },
      crel(
        'div',
        {
          class: 'code-block-menu',
        },
        crel(
          'select',
          {
            class: 'code-name-select',
            onchange: (event: Event) => {
              const { state, dispatch } = this.view;
              const language = (event.target as HTMLSelectElement).value;
              const pos = this.getPos() as number;
              this.view.state.schema.cached.lastLanguage = language;
              if (pos) {
                const tr = state.tr.setNodeAttribute(pos, 'language', language);
                dispatch(tr);
                setTimeout(() => this.view.focus(), 16);
              }
            },
          },
          [
            'plaintext',
            'javascript',
            'html',
            'markdown',
            'typescript',
            'python',
            'java',
          ].map((item) =>
            crel(
              'option',
              { value: item, selected: item === node.attrs.language },
              item
            )
          )
        ),
        crel(
          'div',
          {
            class: 'code-menu-right',
          },
          crel(
            'select',
            {
              class: 'show-line-number-select',
              onchange: (event: Event) => {
                const { state, dispatch } = this.view;
                const showLineNumber =
                  (event.target as HTMLSelectElement).value === 'true';
                const pos = this.getPos();
                if (pos) {
                  const tr = state.tr.setNodeAttribute(
                    pos,
                    'showLineNumber',
                    showLineNumber
                  );
                  dispatch(tr);
                  setTimeout(() => this.view.focus(), 16);
                }
              },
            },
            [
              { value: 'true', label: '展示行号' },
              { value: 'false', label: '隐藏行号' },
            ].map((item) =>
              crel(
                'option',
                {
                  selected: item.value === node.attrs.showLineNumber.toString(),
                  value: item.value,
                },
                item.label
              )
            )
          ),
          crel(
            'button',
            {
              class: 'copy-btn',
              onmousedown: () => {
                navigator.clipboard
                  .writeText(this.node.textContent)
                  .then(() => {
                    alert('copied!');
                  });
              },
            },
            'copy'
          )
        )
      )
    );

    // content dom
    const code = crel('code', {
      class: `code-block language-typescript ${node.attrs.showLineNumber ? 'show-line-number' : ''}`,
      lang: node.attrs.language,
    });

    this.contentDOM = code;

    this.dom.appendChild(menuContainer);
    this.dom.appendChild(code);
  }

  private updateUI(node: Node) {
    const { showLineNumber, language } = node.attrs;
    const showLineNumberClass = 'show-line-number';
    if (
      showLineNumber &&
      !this.contentDOM?.classList.contains(showLineNumberClass)
    ) {
      this.contentDOM?.classList.add(showLineNumberClass);
    }
    if (
      !showLineNumber &&
      this.contentDOM?.classList.contains(showLineNumberClass)
    ) {
      this.contentDOM.classList.remove(showLineNumberClass);
    }

    this.contentDOM!.dataset.lang = language;
  }
}

export const CodeBlockViewConstructor: NodeViewConstructor = (...args) =>
  new CodeBlockView(...args);
