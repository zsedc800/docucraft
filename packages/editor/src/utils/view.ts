import { Node } from 'prosemirror-model';
import {
	Decoration,
	DecorationSource,
	EditorView,
	NodeView
} from 'prosemirror-view';
import createElement from '../createElement';
import {
	ComponentType,
	createElement as h,
	createRoot,
	RootRender
} from '@docucraft/srender';
export class BaseNodeView implements NodeView {
	dom: HTMLElement;
	contentDOM?: HTMLElement;
	container?: HTMLElement;
	rootRender: RootRender;
	component: ComponentType<any> = () => '';
	constructor(
		public node: Node,
		public view: EditorView
	) {
		this.dom = createElement('div');
		this.rootRender = createRoot();
	}

	render(props: any) {
		this.rootRender.render(h(this.component, props));
	}

	ignoreMutation(mutation: MutationRecord) {
		if (this.contentDOM && mutation.target !== this.contentDOM) return true;
		return false;
	}

	update(
		node: Node,
		decorations?: readonly Decoration[],
		innerDecorations?: DecorationSource
	) {
		if (node.type !== this.node.type) return false;
		if (node.attrs.hidden !== this.node.attrs.hidden) {
			if (node.attrs.hidden) {
				this.dom.classList.add('hidden');
			} else {
				this.dom.classList.remove('hidden');
			}
		}
		this.node = node;
		return true;
	}
}
