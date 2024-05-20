"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeBlockViewConstructor = exports.CodeBlockView = void 0;
const createElement_1 = __importDefault(require("../../createElement"));
class CodeBlockView {
    name = 'block_code';
    view;
    getPos;
    dom;
    node;
    contentDOM;
    constructor(...args) {
        const [node, view, getPos] = args;
        this.node = node;
        this.view = view;
        this.getPos = getPos;
        this.renderUI(node);
    }
    update(node, decorations, innerDecorations) {
        this.node = node;
        if (node.type.name !== 'code_block')
            return false;
        this.updateUI(node);
        return true;
    }
    renderUI(node) {
        // pre-wrapper
        this.dom = (0, createElement_1.default)('pre', {
            'data-language': node.attrs.language,
            'data-theme': node.attrs.theme,
            'data-show-line-number': node.attrs.showLineNumber,
            'data-node-type': 'code_block',
        });
        // code-meanu
        const menuContainer = (0, createElement_1.default)('div', {
            class: 'code-block-menu-container',
        }, (0, createElement_1.default)('div', {
            class: 'code-block-menu',
        }, (0, createElement_1.default)('select', {
            class: 'code-name-select',
            onchange: (event) => {
                const { state, dispatch } = this.view;
                const language = event.target.value;
                const pos = this.getPos();
                this.view.state.schema.cached.lastLanguage = language;
                if (pos) {
                    const tr = state.tr.setNodeAttribute(pos, 'language', language);
                    dispatch(tr);
                    setTimeout(() => this.view.focus(), 16);
                }
            },
        }, ...[
            'plaintext',
            'javascript',
            'html',
            'markdown',
            'typescript',
            'python',
            'java',
        ].map((item) => (0, createElement_1.default)('option', { value: item, selected: item === node.attrs.language }, item))), (0, createElement_1.default)('div', {
            class: 'code-menu-right',
        }, (0, createElement_1.default)('select', {
            class: 'show-line-number-select',
            onchange: (event) => {
                const { state, dispatch } = this.view;
                const showLineNumber = event.target.value === 'true';
                const pos = this.getPos();
                if (pos) {
                    const tr = state.tr.setNodeAttribute(pos, 'showLineNumber', showLineNumber);
                    dispatch(tr);
                    setTimeout(() => this.view.focus(), 16);
                }
            },
        }, ...[
            { value: 'true', label: '展示行号' },
            { value: 'false', label: '隐藏行号' },
        ].map((item) => (0, createElement_1.default)('option', {
            selected: item.value === node.attrs.showLineNumber.toString(),
            value: item.value,
        }, item.label))), (0, createElement_1.default)('button', {
            class: 'copy-btn',
            onmousedown: () => {
                navigator.clipboard
                    .writeText(this.node.textContent)
                    .then(() => {
                    alert('copied!');
                });
            },
        }, 'copy'))));
        // content dom
        const code = (0, createElement_1.default)('code', {
            class: `code-block language-typescript ${node.attrs.showLineNumber ? 'show-line-number' : ''}`,
            lang: node.attrs.language,
        });
        this.contentDOM = code;
        this.dom.appendChild(menuContainer);
        this.dom.appendChild(code);
    }
    updateUI(node) {
        const { showLineNumber, language } = node.attrs;
        const showLineNumberClass = 'show-line-number';
        if (showLineNumber &&
            !this.contentDOM?.classList.contains(showLineNumberClass)) {
            this.contentDOM?.classList.add(showLineNumberClass);
        }
        if (!showLineNumber &&
            this.contentDOM?.classList.contains(showLineNumberClass)) {
            this.contentDOM.classList.remove(showLineNumberClass);
        }
        this.contentDOM.dataset.lang = language;
    }
}
exports.CodeBlockView = CodeBlockView;
const CodeBlockViewConstructor = (...args) => new CodeBlockView(...args);
exports.CodeBlockViewConstructor = CodeBlockViewConstructor;
