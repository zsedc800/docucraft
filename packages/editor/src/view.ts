// view.ts
import { EditorView } from 'prosemirror-view';
import { EditorState, Plugin, PluginKey } from 'prosemirror-state';
import { schema } from './model';
import { keymap } from 'prosemirror-keymap';
import { history } from 'prosemirror-history';
import { CodeBlockViewConstructor } from './components/codeBlock/codeBlockView';
// import { highlightCodePlugin } from './components/codeBlock/highlightCodePlugin';
import { myKeymap, buildInputRules } from './commands';
import { buildToolbar } from './components/toolBar';
import './themes/default.scss';
import { TaskItemViewConstructor, taskItem } from './components/taskList';
import { columnResizing, tableEditing } from './components/tables';
import { addView } from './utils';
import { mathRender } from './components/katex';
import { HeadingViewConstructor } from './components/heading';
import { outlineTreePlugin } from './components/outline';

export class Editor {
	constructor(container?: HTMLElement) {
		if (container) this.setup(container);
	}

	setup(container: HTMLElement) {}
}

export const setupEditor = (el: HTMLElement | null) => {
	if (!el) return;

	const toolbar = buildToolbar();

	// 根据 schema 定义，创建 editorState 数据实例
	const editorState = EditorState.create({
		schema,
		plugins: [
			buildInputRules(),
			keymap(myKeymap),
			history(),
			toolbar.plugin,
			// highlightCodePlugin(),
			columnResizing(),
			tableEditing({}),
			mathRender(),
			outlineTreePlugin
		]
	});

	// 创建编辑器视图实例，并挂在到 el 上
	const editorView = new EditorView(el, {
		state: editorState,
		dispatchTransaction(tr) {
			const newState = editorView.state.apply(tr);
			editorView.updateState(newState);
			toolbar.update(editorView, editorView.state);
		},
		nodeViews: {
			codeBlock: CodeBlockViewConstructor,
			taskItem: TaskItemViewConstructor,
			heading: HeadingViewConstructor
		},
		handleClickOn(view, pos, node, nodePos, event, direct) {
			const markType = view.state.schema.marks.link;
			const $pos = view.state.doc.resolve(pos);
			const marks = $pos.marks();
			if (marks.some((mark) => mark.type === markType)) {
				const linkMark = marks.find((mark) => mark.type === markType);
				const { href, target } = linkMark?.attrs || {};
				if (href) {
					if ($pos.end() === pos) return false;
					window.open(href, target);
				}
				return true;
			}
			return false;
		}
	});
	addView(editorView);
	return () => {
		editorView.destroy();
		toolbar.destroy();
	};
};
