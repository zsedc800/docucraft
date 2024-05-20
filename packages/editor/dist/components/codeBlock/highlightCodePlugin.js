"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.highlightCodePlugin = exports.findNodesByType = exports.highlightCodePluginKey = void 0;
const prosemirror_state_1 = require("prosemirror-state");
const prosemirror_view_1 = require("prosemirror-view");
const highlightRenderer_1 = require("./highlightRenderer");
const highlight_js_1 = __importDefault(require("highlight.js"));
const createElement_1 = __importDefault(require("../../createElement"));
exports.highlightCodePluginKey = new prosemirror_state_1.PluginKey('highlight-code');
function findNodesByType(doc, type) {
    const nodes = [];
    const schema = doc.type.schema;
    const tempTypes = Array.isArray(type)
        ? type
        : [type];
    const types = tempTypes
        .map((item) => (typeof item === 'string' ? schema.nodes[item] : item))
        .filter(Boolean);
    doc.descendants((node, pos) => {
        if (types.includes(node.type)) {
            nodes.push({
                node,
                pos,
            });
        }
    });
    return nodes;
}
exports.findNodesByType = findNodesByType;
function createLineNumberDecorations(block) {
    const textContent = block.node.textContent;
    const lineInfos = textContent.split('\n');
    let currentPos = block.pos + 1;
    const decorations = lineInfos.map((item, index) => {
        const span = (0, createElement_1.default)('span', { class: 'line-number', line: `${index + 1}` }, '\u200B');
        const decoration = prosemirror_view_1.Decoration.widget(currentPos, (view) => span, {
            side: -1,
            ignoreSelection: true,
            destroy() {
                span.remove();
            },
        });
        currentPos += item.length + 1;
        return decoration;
    });
    return decorations;
}
function highlightCodePlugin() {
    function getDecs(doc) {
        if (!doc || !doc.nodeSize) {
            return [];
        }
        const blocks = findNodesByType(doc, 'code_block');
        let decorations = [];
        blocks.forEach((block) => {
            let language = block.node.attrs.language;
            if (language && !highlight_js_1.default.getLanguage(language))
                language = 'plaintext';
            const highlightResult = language
                ? highlight_js_1.default.highlight(block.node.textContent, { language })
                : highlight_js_1.default.highlightAuto(block.node.textContent);
            const emitter = highlightResult._emitter;
            const renderer = new highlightRenderer_1.HighlightRenderer(emitter, block.pos);
            console.log(renderer.value, 'val');
            if (renderer.value.length) {
                const blockDecorations = renderer.value.map((renderInfo) => prosemirror_view_1.Decoration.inline(renderInfo.from, renderInfo.to, {
                    class: renderInfo.classNames.join(' '),
                }));
                decorations = decorations.concat(blockDecorations);
            }
            if (block.node.attrs.showLineNumber) {
                const lineNumberDecorations = createLineNumberDecorations(block);
                decorations = decorations.concat(lineNumberDecorations);
            }
        });
        return decorations;
    }
    return new prosemirror_state_1.Plugin({
        key: exports.highlightCodePluginKey,
        state: {
            init(config, instance) {
                const decorations = getDecs(instance.doc);
                return {
                    decorations: prosemirror_view_1.DecorationSet.create(instance.doc, decorations),
                };
            },
            apply(tr, value, oldState, newState) {
                if (!tr.docChanged)
                    return value;
                const decorations = getDecs(newState.doc);
                return {
                    decorations: prosemirror_view_1.DecorationSet.create(tr.doc, decorations),
                };
            },
        },
        props: {
            decorations(state) {
                const pluginState = exports.highlightCodePluginKey.getState(state);
                return pluginState?.decorations;
            },
        },
    });
}
exports.highlightCodePlugin = highlightCodePlugin;
