import { Command, EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Rect, TableMap } from './tableMap';
import { Node } from 'prosemirror-model';
import {
  CellAttrs,
  addColspan,
  columnIsHeader,
  isInTable,
  selectionCell,
} from './utils';
import { CellAttributes, tableNodeTypes } from './schema';
import { CellSelection } from './cellSelection';
export const createTable: (rows: number, columns: number) => Command =
  (rows, columns) => (state, dispatch, view) => {
    const { table, tableRow, tableHeader, tableCell, paragraph } =
      state.schema.nodes;

    const tableNode = table.create(
      null,
      Array(rows + 1)
        .fill(null)
        .map((_, row) =>
          tableRow.create(
            null,
            Array(columns)
              .fill(null)
              .map((_, col) =>
                (row === 0 ? tableHeader : tableCell).create(
                  null,
                  paragraph.create(
                    null,
                    state.schema.text('cell row ' + row + ', col ' + col)
                  )
                )
              )
          )
        )
    );
    TableMap.get(tableNode);
    if (dispatch) {
      dispatch(state.tr.replaceSelectionWith(tableNode).scrollIntoView());
      return true;
    }

    return false;
  };

export function insertTable(
  state: EditorState,
  dispatch: EditorView['dispatch']
) {
  const { schema } = state;
  const table = schema.nodes.table;
  const row = schema.nodes.table_row;
  const cell = schema.nodes.table_cell;
  const paragraph = schema.nodes.paragraph;
  const tableNode = table.create(
    null,
    Array(3)
      .fill(null)
      .map((_, r) =>
        row.create(
          null,
          Array(3)
            .fill(null)
            .map((_, col) =>
              cell.create(
                null,
                paragraph.create(
                  null,
                  schema.text(`hello row ${r + 1} col ${col + 1}`)
                )
              )
            )
        )
      )
  );
  dispatch(state.tr.replaceSelectionWith(tableNode).scrollIntoView());
}

export type TableRect = Rect & {
  tableStart: number;
  map: TableMap;
  table: Node;
};

export function selectedRect(state: EditorState): TableRect {
  const sel = state.selection;
  const $pos = selectionCell(state);
  const table = $pos.node(-1);
  const tableStart = $pos.start(-1);
  const map = TableMap.get(table);

  const rect =
    sel instanceof CellSelection
      ? map.rectBetween(
          sel.$anchorCell.pos - tableStart,
          sel.$headCell.pos - tableStart
        )
      : map.findCell($pos.pos - tableStart);

  return { ...rect, tableStart, map, table };
}

export function addColumn(
  tr: Transaction,
  { map, table, tableStart }: TableRect,
  col: number
) {
  let refColumn: number | null = col > 0 ? -1 : 0;
  if (columnIsHeader(map, table, col + refColumn)) {
    refColumn = col == 0 || col == map.width ? null : 0;
  }

  for (let row = 0; row < map.height; row++) {
    const index = row * map.width + col;
    if (col > 0 && col < map.width && map.map[index - 1] == map.map[index]) {
      const pos = map.map[index];
      const cell = table.nodeAt(pos)!;
      tr.setNodeMarkup(
        tr.mapping.map(tableStart + pos),
        null,
        addColspan(cell.attrs as CellAttrs, col - map.colCount(pos))
      );
      row += cell.attrs.rowspan - 1;
    } else {
      const type =
        refColumn == null
          ? tableNodeTypes(table.type.schema).cell
          : table.nodeAt(map.map[index + refColumn])!.type;
      const pos = map.positionAt(row, col, table);
      tr.insert(tr.mapping.map(tableStart + pos), type.createAndFill()!);
    }
  }
  return tr;
}

export const addColumnBefore: Command = (state, dispatch) => {
  if (!isInTable(state)) return false;
  if (dispatch) {
    const rect = selectedRect(state);
    dispatch(addColumn(state.tr, rect, rect.left));
  }
  return true;
};

export const addColumnAfter: Command = (state, dispatch) => {
  if (!isInTable(state)) return false;
  if (dispatch) {
    const rect = selectedRect(state);
    dispatch(addColumn(state.tr, rect, rect.right));
  }
  return true;
};
