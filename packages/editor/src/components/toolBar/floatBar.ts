import { EditorState, PluginView } from 'prosemirror-state';
import createElement from '../../createElement';
import { EditorView } from 'prosemirror-view';
import { MenuItem, MenuItemSpec } from './menuItem';
interface Spec {
	class?: string;
	menus: MenuItemSpec[];
}
export class FloatBar implements PluginView {
	dom: HTMLElement;
	menus: MenuItem[];
	constructor(view: EditorView, spec: Spec) {
		this.menus = spec.menus.map((menu) => new MenuItem(view, menu));
		this.dom = createElement(
			'div',
			{ class: spec.class || 'dc-float-bar' },
			this.menus.map((menu) => menu.dom)
		);
	}

	update(view: EditorView, state: EditorState) {
		this.menus.forEach((menu) => menu.update(view, state));
	}

	destroy() {}
}
