import { EditorState, PluginView } from 'prosemirror-state';
import { MenuGroup, MenuGroupSpec } from './menuGroup';
import { EditorView } from 'prosemirror-view';

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
