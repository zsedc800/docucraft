import { Plugin } from 'prosemirror-state';
import { tableEditingKey } from './utils';
import { drawCellSelection, normalizeSelection } from './cellSelection';
import { fixTables } from './fixtables';

export { tableNodeTypes, tableNodes } from './schema';
export { TableView } from './tableView';
import './style.css';
import { handleMouseDown } from './input';

export type TableEditingOptions = {
  allowTableNodeSelection?: boolean;
};

export function tableEditing({
  allowTableNodeSelection = false,
}: TableEditingOptions): Plugin {
  return new Plugin({
    key: tableEditingKey,
    state: {
      init() {
        return null;
      },
      apply(tr, value) {
        const set = tr.getMeta(tableEditingKey);
        if (set != null) return set == -1 ? null : set;
        if (value == null || !tr.docChanged) return value;
        const { deleted, pos } = tr.mapping.mapResult(value);
        return deleted ? null : pos;
      },
    },
    props: {
      decorations: drawCellSelection,
      handleDOMEvents: {
        mousedown: handleMouseDown,
      },
      createSelectionBetween(view) {
        return tableEditingKey.getState(view.state) != null
          ? view.state.selection
          : null;
      },
    },
    appendTransaction(_, oldState, newState) {
      return normalizeSelection(
        newState,
        fixTables(newState, oldState),
        allowTableNodeSelection
      );
    },
  });
}
