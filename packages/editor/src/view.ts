// view.ts
import { EditorView } from 'prosemirror-view';
import { EditorState, Plugin, PluginKey } from 'prosemirror-state';
import { schema } from './model';
import { keymap } from 'prosemirror-keymap';
import { history } from 'prosemirror-history';
import { CodeBlockViewConstructor } from './components/codeBlock/codeBlockView';
import { highlightCodePlugin } from './components/codeBlock/highlightCodePlugin';
import { myKeymap, buildInputRules } from './commands';
import { buildToolbar } from './components/toolBar';
import './themes/default.scss';
import { TaskItemViewConstructor, taskItem } from './components/taskList';
import { tableEditing } from './components/tables';
import { addView } from './utils';

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
			highlightCodePlugin(),
			tableEditing({})
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
			taskItem: TaskItemViewConstructor
		}
	});
	addView(editorView);
	return () => {
		editorView.destroy();
		toolbar.destroy();
	};
};
