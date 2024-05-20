"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCodeBlockCmd = exports.codeBlock = void 0;
exports.codeBlock = {
    content: 'text*',
    group: 'block',
    marks: '',
    code: true,
    defining: true,
    draggable: false,
    selectable: true,
    isolating: true,
    attrs: {
        language: {
            default: 'plaintext',
        },
        theme: {
            default: 'dark',
        },
        showLineNumber: {
            default: true,
        },
    },
    toDOM(node) {
        return [
            'pre',
            {
                'data-lanaguage': node.attrs.lanaguage,
                'data-theme': node.attrs.theme,
                'data-show-line-number': node.attrs.showLineNumber,
                'data-node-type': 'code_block',
            },
            ['code', 0],
        ];
    },
    parseDOM: [
        {
            tag: 'pre',
            preserveWhitespace: 'full',
            getAttrs(domNode) {
                return {
                    language: domNode.getAttribute('data-language'),
                    theme: domNode.getAttribute('data-theme'),
                    showLineNumber: domNode.getAttribute('data-show-line-number'),
                };
            },
        },
    ],
};
const createCodeBlockCmd = (state, dispatch, view) => {
    const lastLanguage = state.schema.cached.lastLanguage || 'plaintext';
    const { code_block } = state.schema.nodes;
    const codeBlockNode = code_block.create({ language: lastLanguage });
    let tr = state.tr;
    tr.replaceSelectionWith(codeBlockNode);
    tr.scrollIntoView();
    if (dispatch) {
        dispatch(tr);
        return true;
    }
    return false;
};
exports.createCodeBlockCmd = createCodeBlockCmd;
