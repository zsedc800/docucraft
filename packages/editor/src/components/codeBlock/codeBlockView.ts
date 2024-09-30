import { Node } from 'prosemirror-model';
import crel, { updateElement } from '../../createElement';
import {
	Decoration,
	DecorationSource,
	EditorView,
	NodeView,
	NodeViewConstructor
} from 'prosemirror-view';
// import { setup } from './menu';
import { BaseNodeView } from '../../utils/view';
type GetPos = () => number | undefined;
export class CodeBlockView extends BaseNodeView {
	name = 'blockCode';
	getPos: GetPos;
	unmount?: () => void;
	menu: HTMLElement;
	// root: ReactDOM.Root;
	contentDOM?: HTMLElement | null | undefined;
	constructor(...args: Parameters<NodeViewConstructor>) {
		const [node, view, getPos] = args;
		super(node, view);
		this.getPos = getPos;
		this.contentDOM = crel('code', {
			class: 'scrollbar dc-block',
			'data-language': node.attrs.language,
			'data-theme': node.attrs.theme,
			'data-show-line-number': node.attrs.showLineNumber,
			'data-node-type': 'codeBlock'
		});
		this.menu = crel('div', { class: 'code-block-menu-container' });
		this.dom = crel('pre', {
			class: 'docucraft-codeblock hljs',
			'data-language': node.attrs.language,
			'data-theme': node.attrs.theme,
			'data-show-line-number': node.attrs.showLineNumber,
			'data-node-type': 'codeBlock'
		});
		// this.root = ReactDOM.createRoot(this.menu);
		this.dom.appendChild(this.menu);
		this.dom.appendChild(this.contentDOM);
		this.renderComponent();
	}

	renderComponent() {
		// setup(this);
	}

	update(node: Node) {
		const res = super.update(node);
		if (!res) return false;
		this.node = node;
		updateElement(this.dom, {
			'data-language': node.attrs.language,
			'data-theme': node.attrs.theme,
			'data-show-line-number': node.attrs.showLineNumber
		});
		updateElement(this.contentDOM as HTMLElement, {
			'data-language': node.attrs.language,
			'data-theme': node.attrs.theme,
			'data-show-line-number': node.attrs.showLineNumber
		});

		this.renderComponent();

		return true;
	}

	destroy() {
		console.log('destroy code');

		// this.root.unmount();
	}
}

export const CodeBlockViewConstructor: NodeViewConstructor = (...args) =>
	new CodeBlockView(...args);
