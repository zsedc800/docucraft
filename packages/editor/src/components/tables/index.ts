import { EditorState, Plugin } from 'prosemirror-state';
import { TableState, tableEditingKey } from './utils';
import { drawCellSelection, normalizeSelection } from './cellSelection';
import { fixTables } from './fixtables';

export { tableNodeTypes, tableNodes } from './schema';
export { TableView } from './tableView';
import './style.scss';
import { handleMouseDown } from './input';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { TableView, TableViewConstructor, addToolkit } from './tableView';

export type TableEditingOptions = {
  allowTableNodeSelection?: boolean;
};

export function tableEditing({
  allowTableNodeSelection = false,
}: TableEditingOptions): Plugin {
  const getDecorations = (state: EditorState) => {
    let decs: Decoration[] = [];
    decs = decs.concat(drawCellSelection(state));
    state.doc.descendants((node, pos) => {
      if (node.type.name !== 'table') return;
      decs = decs.concat(addToolkit(node, pos));
    });
    return decs;
  };

  return new Plugin<TableState>({
    key: tableEditingKey,
    state: {
      init(_, state) {
        return {
          decorations: DecorationSet.create(state.doc, getDecorations(state)),
          set: null,
        };
      },
      apply(tr, value, _, state) {
        const { set, hoverDecos } = tr.getMeta(tableEditingKey) || {};
        if (set != null) return { ...value, set: set == -1 ? null : set };
        if (!tr.docChanged && !hoverDecos) return value;
        const { deleted, pos } = tr.mapping.mapResult(set);
        const decorations = getDecorations(state).concat(
          hoverDecos ? hoverDecos : value.hoverDecos || []
        );

        return {
          set: deleted ? null : pos,
          decorations: DecorationSet.create(state.doc, decorations),
          hoverDecos,
        };
      },
    },
    props: {
      nodeViews: {
        table: TableViewConstructor,
      },
      decorations(state) {
        return this.getState(state)?.decorations;
      },
      handleDOMEvents: {
        mousedown: handleMouseDown,
      },
      // createSelectionBetween(view) {
      //   return tableEditingKey.getState(view.state)?.set != null
      //     ? view.state.selection
      //     : null;
      // },
    },
    // appendTransaction(_, oldState, newState) {
    //   return normalizeSelection(
    //     newState,
    //     // newState.tr,
    //     fixTables(newState, oldState),
    //     allowTableNodeSelection
    //   );
    // },
  });
}
