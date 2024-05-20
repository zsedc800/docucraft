// view.ts
import { EditorView } from 'prosemirror-view';
import { EditorState, Plugin, PluginKey } from 'prosemirror-state';
import { schema } from './model';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';
import { history, redo, undo } from 'prosemirror-history';
import { ToolBar } from './components/toolBar';
import { createCodeBlockCmd } from './components/codeBlock';
import { CodeBlockViewConstructor } from './components/codeBlock/codeBlockView';
import { highlightCodePlugin } from './components/codeBlock/highlightCodePlugin';

export const setupEditor = (el: HTMLElement | null) => {
  if (!el) return;

  let toolbar: ToolBar | null;

  const toolbarPlugin = new Plugin({
    key: new PluginKey('toolbar'),
    view(view) {
      toolbar = new ToolBar(view, {
        groups: [
          {
            menus: [
              {
                label: '插入代码块',
                handler({ state, dispatch, view }, event) {
                  createCodeBlockCmd(state, dispatch, view);
                },
              },
            ],
          },
        ],
      });
      return toolbar;
    },
  });

  // 根据 schema 定义，创建 editorState 数据实例
  const editorState = EditorState.create({
    schema,
    plugins: [
      keymap(baseKeymap),
      history(),
      keymap({ 'Mod-z': undo, 'Mod-y': redo }),
      toolbarPlugin,
      highlightCodePlugin(),
    ],
  });

  // 创建编辑器视图实例，并挂在到 el 上
  const editorView = new EditorView(el, {
    state: editorState,
    dispatchTransaction(tr) {
      const newState = editorView.state.apply(tr);
      editorView.updateState(newState);
      toolbar?.update(editorView, editorView.state);
    },
    nodeViews: {
      code_block: CodeBlockViewConstructor,
    },
  });

  console.log('editorView', editorView);
  return () => {
    editorView.destroy();
    toolbar?.destroy();
    toolbar = null;
  };
};
