import { Fragment } from 'prosemirror-model';
import { Command, EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

export const createTable: (rows: number, columns: number) => Command =
  (rows, columns) => (state, dispatch, view) => {
    const { table, tableRow, tableHeader, tableCell, paragraph } =
      state.schema.nodes;
    if (dispatch) {
      dispatch(
        state.tr
          .replaceSelectionWith(
            table.create(
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
                            state.schema.text(
                              'cell row ' + row + ', col ' + col
                            )
                          )
                        )
                      )
                  )
                )
            )
          )
          .scrollIntoView()
      );
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
