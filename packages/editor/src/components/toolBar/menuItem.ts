import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

export interface MenuItemSpec {
	class?: string;
	label: string;
	content?: HTMLElement;
	handler: (
		props: {
			view: EditorView;
			state: EditorState;
			tr: Transaction;
			dispatch: EditorView['dispatch'];
		},
		event: MouseEvent
	) => void;
	update?: (view: EditorView, state: EditorState, menu: HTMLElement) => void;
}

export class MenuItem {
	dom: HTMLElement;
	constructor(
		private view: EditorView,
		private spec: MenuItemSpec
	) {
		const btn = document.createElement('button');
		btn.setAttribute('class', spec.class || '');
		btn.addEventListener('click', (event: MouseEvent) => {
			spec.handler(
				{
					view: this.view,
					state: this.view.state,
					dispatch: view.dispatch,
					tr: view.state.tr
				},
				event
			);
		});
		btn.classList.add('menu-item');
		btn.innerText = spec.label;
		this.dom = btn;
	}

	update(view: EditorView, state: EditorState) {
		this.view = view;
		this.spec.update?.(view, state, this.dom);
	}
}
