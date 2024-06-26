import { EditorView } from 'prosemirror-view';
import { MenuItem, MenuItemSpec } from './menuItem';
import { EditorState } from 'prosemirror-state';

export interface MenuGroupSpec {
  name?: string;
  class?: string;
  menus: MenuItemSpec[];
}

export class MenuGroup {
  dom: HTMLElement;
  private menus: MenuItem[];
  constructor(
    private view: EditorView,
    private spec: MenuGroupSpec
  ) {
    const dom = document.createElement('div');
    dom.setAttribute('class', spec.class || '');
    dom.classList.add('menu-group');

    this.dom = dom;
    this.menus = spec.menus.map(
      (menuSpec) => new MenuItem(this.view, menuSpec)
    );

    this.menus.forEach((menu) => dom.appendChild(menu.dom));
  }

  update(view: EditorView, state: EditorState) {
    this.view = view;
    this.menus.forEach((menu) => menu.update(view, state));
  }
}
