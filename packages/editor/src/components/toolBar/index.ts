import { EditorState, PluginView, Plugin, PluginKey } from 'prosemirror-state';
import { MenuGroup, MenuGroupSpec } from './menuGroup';
import { EditorView } from 'prosemirror-view';
import { createCodeBlockCmd } from '../codeBlock';
import { createTaskList } from '../taskList';
import { createTable, insertTable } from '../tables/commands';

export interface ToolBarSpec {
  groups: MenuGroupSpec[];
  class?: string;
}

export class ToolBar implements PluginView {
  dom: HTMLElement;
  private groups: MenuGroup[];
  constructor(
    private view: EditorView,
    private spec: ToolBarSpec
  ) {
    const dom = document.createElement('div');
    dom.setAttribute('class', this.spec.class || '');
    dom.classList.add('toolbar');

    this.dom = dom;
    this.groups = this.spec.groups.map(
      (menuGroupSpec) => new MenuGroup(this.view, menuGroupSpec)
    );
    this.groups.forEach((menuGroup) => dom.appendChild(menuGroup.dom));
    this.render();
  }

  render() {
    if (this.view.dom.parentNode) {
      this.view.dom.parentNode.insertBefore(this.dom, this.view.dom);
    }
  }

  update(view: EditorView, state: EditorState) {
    this.view = view;
    this.groups.forEach((group) => group.update(view, state));
  }

  destroy() {
    this.dom.parentNode?.removeChild(this.dom);
  }
}

export const buildToolbar = () => {
  let toolbar: ToolBar | null;
  const toolbarPlugin = new Plugin({
    key: new PluginKey('toolbar'),
    view(view) {
      toolbar = new ToolBar(view, {
        groups: [
          {
            menus: [
              {
                label: '插入代码块',
                handler({ state, dispatch, view }, event) {
                  createCodeBlockCmd(state, dispatch, view);
                },
              },
              {
                label: '插入tasklist',
                handler({ state, dispatch, view }) {
                  createTaskList(state, dispatch, view);
                },
              },
              {
                label: '插入表格',
                handler({ state, dispatch, view }) {
                  createTable(3, 4)(state, dispatch, view);
                  // insertTable(state, dispatch);
                },
              },
            ],
          },
        ],
      });
      return toolbar;
    },
  });

  return {
    plugin: toolbarPlugin,
    update: (view: EditorView, state: EditorState) =>
      toolbar?.update(view, state),
    destroy: () => {
      toolbar?.destroy();
      toolbar = null;
    },
  };
};
