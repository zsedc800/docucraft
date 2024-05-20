"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupEditor = void 0;
// view.ts
const prosemirror_view_1 = require("prosemirror-view");
const prosemirror_state_1 = require("prosemirror-state");
const model_1 = require("./model");
const prosemirror_keymap_1 = require("prosemirror-keymap");
const prosemirror_commands_1 = require("prosemirror-commands");
const prosemirror_history_1 = require("prosemirror-history");
const toolBar_1 = require("./components/toolBar");
const codeBlock_1 = require("./components/codeBlock");
const codeBlockView_1 = require("./components/codeBlock/codeBlockView");
const highlightCodePlugin_1 = require("./components/codeBlock/highlightCodePlugin");
const setupEditor = (el) => {
    if (!el)
        return;
    let toolbar;
    const toolbarPlugin = new prosemirror_state_1.Plugin({
        key: new prosemirror_state_1.PluginKey('toolbar'),
        view(view) {
            toolbar = new toolBar_1.ToolBar(view, {
                groups: [
                    {
                        menus: [
                            {
                                label: '插入代码块',
                                handler({ state, dispatch, view }, event) {
                                    (0, codeBlock_1.createCodeBlockCmd)(state, dispatch, view);
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
    const editorState = prosemirror_state_1.EditorState.create({
        schema: model_1.schema,
        plugins: [
            (0, prosemirror_keymap_1.keymap)(prosemirror_commands_1.baseKeymap),
            (0, prosemirror_history_1.history)(),
            (0, prosemirror_keymap_1.keymap)({ 'Mod-z': prosemirror_history_1.undo, 'Mod-y': prosemirror_history_1.redo }),
            toolbarPlugin,
            (0, highlightCodePlugin_1.highlightCodePlugin)(),
        ],
    });
    // 创建编辑器视图实例，并挂在到 el 上
    const editorView = new prosemirror_view_1.EditorView(el, {
        state: editorState,
        dispatchTransaction(tr) {
            const newState = editorView.state.apply(tr);
            editorView.updateState(newState);
            toolbar?.update(editorView, editorView.state);
        },
        nodeViews: {
            code_block: codeBlockView_1.CodeBlockViewConstructor,
        },
    });
    console.log('editorView', editorView);
    return () => {
        editorView.destroy();
        toolbar?.destroy();
        toolbar = null;
    };
};
exports.setupEditor = setupEditor;
