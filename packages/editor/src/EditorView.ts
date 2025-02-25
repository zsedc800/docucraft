import {
	DirectEditorProps,
	EditorView as ProseMirrorEditorView
} from 'prosemirror-view';
import { DOMNode } from './interface';

export default class EditorView extends ProseMirrorEditorView {
	store = { id: 1 };
	domBefore: HTMLElement;
	domAfter: HTMLElement;
	constructor(
		place:
			| null
			| DOMNode
			| ((editor: HTMLElement) => void)
			| {
					mount: HTMLElement;
			  },
		props: DirectEditorProps
	) {
		super(place, props);
		this.domBefore = document.createElement('div');
		this.domAfter = document.createElement('div');
		const parent = this.dom.parentNode;

		if (parent) {
			parent.insertBefore(this.domBefore, this.dom);
			const nextNode = this.dom.nextElementSibling;
			if (nextNode) parent.insertBefore(this.domAfter, nextNode);
			else parent.appendChild(this.domAfter);
		}
	}
	destroy(): void {
		super.destroy();
		this.domBefore.parentNode?.removeChild(this.domBefore);
		this.domAfter.parentNode?.removeChild(this.domAfter);
	}
}
