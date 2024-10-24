import { Fragment, Node } from 'prosemirror-model';
import { NodeViewConstructor } from 'prosemirror-view';
import { BaseNodeView } from '../../utils/view';
import CodeBlock from './CodeBlock';
import { shallowEqual } from '../../utils';
import { basicSetup, EditorView } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { EditorState, Compartment } from '@codemirror/state';
import { oneDark } from './themes/theme-one-dark';
import { baseTheme } from './themes/base';
import { ViewUpdate } from '@codemirror/view';

type GetPos = () => number | undefined;
export class CodeBlockView extends BaseNodeView {
	name = 'blockCode';
	getPos: GetPos;
	unmount?: () => void;
	cmv: EditorView;
	codeContainer?: HTMLElement;
	constructor(...args: Parameters<NodeViewConstructor>) {
		const [node, view, getPos] = args;
		super(node, view);
		this.getPos = getPos;
		this.component = CodeBlock;
		this.render({ nodeView: this, ...node.attrs });

		let language = new Compartment(),
			tabSize = new Compartment();
		const state = EditorState.create({
			extensions: [
				basicSetup,
				language.of(javascript()),
				tabSize.of(EditorState.tabSize.of(2)),
				EditorView.updateListener.of(this.onCMUpdate.bind(this)),
				baseTheme,
				oneDark
			]
		});
		this.cmv = new EditorView({
			state,
			parent: this.codeContainer
		});
	}

	onCMUpdate(update: ViewUpdate) {
		if (!update.docChanged) return;
		const content = this.cmv.state.doc.toString();
		const pos = this.getPos();

		if ((pos || pos === 0) && content) {
			const transaction = this.view.state.tr.replaceWith(
				pos,
				pos + this.node.nodeSize,
				this.node.copy(Fragment.from(this.view.state.schema.text(content)))
			);
			this.view.dispatch(transaction);
		}
	}

	ignoreMutation(mutation: MutationRecord): boolean {
		return true;
	}

	stopEvent(e: Event) {
		return e.target === this.codeContainer || this.cmv.hasFocus;
	}

	update(node: Node) {
		const { type, attrs } = node;
		const { attrs: props, type: t } = this.node;
		if (type !== t) return false;

		this.node = node;
		if (!shallowEqual(props, attrs)) this.render({ nodeView: this, ...attrs });
		return true;
	}

	destroy() {
		console.log('destroy code');
		this.cmv.destroy();
		this.rootRender.unmount();
	}
}

export const CodeBlockViewConstructor: NodeViewConstructor = (...args) =>
	new CodeBlockView(...args);
