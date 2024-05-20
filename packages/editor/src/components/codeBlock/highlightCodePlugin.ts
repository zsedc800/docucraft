import { Node, NodeType } from 'prosemirror-model';
import { PluginKey, Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { HighlightRenderer } from './highlightRenderer';
import hljs from 'highlight.js';
import createElement from '../../createElement';

interface HighlightCodePluginState {
  decorations: DecorationSet;
}

export interface NodeWithPos {
  node: Node;
  pos: number;
}

export const highlightCodePluginKey = new PluginKey<HighlightCodePluginState>(
  'highlight-code'
);

export function findNodesByType(
  doc: Node,
  type: string | string[] | NodeType | NodeType[]
): NodeWithPos[] {
  const nodes: NodeWithPos[] = [];
  const schema = doc.type.schema;
  const tempTypes: string[] | NodeType[] = Array.isArray(type)
    ? type
    : ([type] as string[] | NodeType[]);

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

function createLineNumberDecorations(block: NodeWithPos): Decoration[] {
  const textContent = block.node.textContent;
  const lineInfos = textContent.split('\n');

  let currentPos = block.pos + 1;

  const decorations: Decoration[] = lineInfos.map((item, index) => {
    const span = createElement(
      'span',
      { class: 'line-number', line: `${index + 1}` },
      '\u200B'
    );
    const decoration = Decoration.widget(currentPos, (view) => span, {
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

export function highlightCodePlugin() {
  function getDecs(doc: Node): Decoration[] {
    if (!doc || !doc.nodeSize) {
      return [];
    }
    const blocks = findNodesByType(doc, 'code_block');
    let decorations: Decoration[] = [];

    blocks.forEach((block) => {
      let language: string = block.node.attrs.language;

      if (language && !hljs.getLanguage(language)) language = 'plaintext';

      const highlightResult = language
        ? hljs.highlight(block.node.textContent, { language })
        : hljs.highlightAuto(block.node.textContent);

      const emitter = highlightResult._emitter;

      const renderer = new HighlightRenderer(emitter, block.pos);

      console.log(renderer.value, 'val');

      if (renderer.value.length) {
        const blockDecorations = renderer.value.map((renderInfo) =>
          Decoration.inline(renderInfo.from, renderInfo.to, {
            class: renderInfo.classNames.join(' '),
          })
        );

        decorations = decorations.concat(blockDecorations);
      }

      if (block.node.attrs.showLineNumber) {
        const lineNumberDecorations = createLineNumberDecorations(block);
        decorations = decorations.concat(lineNumberDecorations);
      }
    });
    return decorations;
  }

  return new Plugin({
    key: highlightCodePluginKey,
    state: {
      init(config, instance) {
        const decorations = getDecs(instance.doc);
        return {
          decorations: DecorationSet.create(instance.doc, decorations),
        };
      },
      apply(tr, value, oldState, newState) {
        if (!tr.docChanged) return value;
        const decorations = getDecs(newState.doc);
        return {
          decorations: DecorationSet.create(tr.doc, decorations),
        };
      },
    },
    props: {
      decorations(state) {
        const pluginState = highlightCodePluginKey.getState(state);
        return pluginState?.decorations;
      },
    },
  });
}
