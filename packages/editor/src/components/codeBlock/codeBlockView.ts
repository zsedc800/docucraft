import { Fragment, Node } from 'prosemirror-model';
import { NodeViewConstructor } from 'prosemirror-view';
import { BaseNodeView } from '../../utils/view';
import CodeBlock from './CodeBlock';
import { shallowEqual } from '../../utils';
import { EditorView } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { ViewUpdate, lineNumbers } from '@codemirror/view';
import extensions, { lineNumberCompartment } from './extensions';
import { detectLanguageFromCode, setLanguage } from './extensions/loadLanguage';
import { isEditorEmpty, isFullSelection } from './utils';
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

		const state = EditorState.create({
			extensions: extensions.concat([
				lineNumberCompartment.of(
					node.attrs.showLineNumber ? lineNumbers() : []
				),
				EditorView.updateListener.of(this.onCMUpdate.bind(this)),
				EditorView.domEventHandlers({
					paste: (event, view) => {
						const pastedText = event.clipboardData?.getData('text/plain') || '';

						if (isEditorEmpty(view) || isFullSelection(view)) {
							detectLanguageFromCode(pastedText).then((lang) => {
								setLanguage(lang, view);
								this.updateAttrs('language', lang);
							}); // 自动检测语言
						}
					}
				})
			])
		});
		this.cmv = new EditorView({
			state,
			parent: this.codeContainer
		});

		setLanguage(node.attrs.language, this.cmv);
		setTimeout(() => this.cmv.focus(), 17);
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

	updateAttrs(name: string, value: any) {
		const pos = this.getPos() as number;
		if (pos || pos == 0) {
			const tr = this.view.state.tr.setNodeAttribute(pos, name, value);
			this.view.dispatch(tr);
		}
	}

	ignoreMutation(mutation: MutationRecord): boolean {
		return true;
	}

	stopEvent(e: Event) {
		// return e.target === this.codeContainer || this.cmv.hasFocus;
		return true;
	}

	update(node: Node) {
		const { type, attrs } = node;
		const { attrs: props, type: t } = this.node;
		if (type !== t) return false;

		this.node = node;
		if (!shallowEqual(props, attrs)) {
			this.render({ nodeView: this, ...attrs });
			setTimeout(() => this.cmv.focus(), 17);
		}
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
