import { Fragment, Node, ResolvedPos, Slice } from 'prosemirror-model';
import {
  EditorState,
  NodeSelection,
  Selection,
  SelectionRange,
  TextSelection,
  Transaction,
} from 'prosemirror-state';
import { Mappable } from 'prosemirror-transform';
import { TableMap } from './tableMap';
import { CellAttrs, inSameTable, pointsAtCell, removeColSpan } from './utils';
import { Decoration, DecorationSet, DecorationSource } from 'prosemirror-view';

export interface CellSelectionJSON {
  type: string;
  anchor: number;
  head: number;
}

export class CellSelection extends Selection {
  $anchorCell: ResolvedPos;
  $headCell: ResolvedPos;

  constructor($anchorCell: ResolvedPos, $headCell: ResolvedPos = $anchorCell) {
    const table = $anchorCell.node(-1);
    const map = TableMap.get(table);
    const tableStart = $anchorCell.start(-1);
    const rect = map.rectBetween(
      $anchorCell.pos - tableStart,
      $headCell.pos - tableStart
    );
    const doc = $anchorCell.node(0);
    const cells = map
      .cellsInRect(rect)
      .filter((p) => p != $headCell.pos - tableStart);

    cells.unshift($headCell.pos - tableStart);
    const ranges = cells.map((pos) => {
      const cell = table.nodeAt(pos);
      if (!cell) {
        throw new RangeError(`No cell with offset ${pos} found`);
      }
      const from = tableStart + pos + 1;
      return new SelectionRange(
        doc.resolve(from),
        doc.resolve(from + cell.content.size)
      );
    });
    super(ranges[0].$from, ranges[0].$to, ranges);
    this.$anchorCell = $anchorCell;
    this.$headCell = $headCell;
  }
  eq(selection: unknown): boolean {
    return (
      selection instanceof CellSelection &&
      selection.$anchorCell.pos == this.$anchorCell.pos &&
      selection.$headCell.pos == this.$headCell.pos
    );
  }
  map(doc: Node, mapping: Mappable): CellSelection | Selection {
    const $anchorCell = doc.resolve(mapping.map(this.$anchorCell.pos));
    const $headCell = doc.resolve(mapping.map(this.$headCell.pos));

    if (
      pointsAtCell($anchorCell) &&
      pointsAtCell($headCell) &&
      inSameTable($anchorCell, $headCell)
    ) {
      const tableChanged = this.$anchorCell.node(-1) != $anchorCell.node(-1);
      if (tableChanged && this.isRowSelection())
        return CellSelection.rowSelection($anchorCell, $headCell);
      else if (tableChanged && this.isColSelection())
        return CellSelection.colSelection($anchorCell, $headCell);
      else return new CellSelection($anchorCell, $headCell);
    }

    return TextSelection.between($anchorCell, $headCell);
  }
  toJSON() {
    return {
      type: 'cell',
      anchor: this.$anchorCell.pos,
      head: this.$headCell.pos,
    };
  }

  public isRowSelection(): boolean {
    const table = this.$anchorCell.node(-1);
    const map = TableMap.get(table);
    const tableStart = this.$anchorCell.start(-1);

    const anchorLeft = map.colCount(this.$anchorCell.pos - tableStart);
    const headLeft = map.colCount(this.$headCell.pos - tableStart);
    if (Math.min(anchorLeft, headLeft) > 0) return false;
    const anchorRight = anchorLeft + this.$anchorCell.nodeAfter!.attrs.colspan;
    const headRight = headLeft + this.$headCell.nodeAfter!.attrs.colspan;
    return Math.max(anchorRight, headRight) == map.width;
  }

  public isColSelection(): boolean {
    const anchorTop = this.$anchorCell.index(-1);
    const headTop = this.$headCell.index(-1);
    if (Math.min(anchorTop, headTop) > 0) return false;

    const anchorBottom = anchorTop + this.$anchorCell.nodeAfter!.attrs.rowspan;
    const headBottom = headTop + this.$headCell.nodeAfter!.attrs.rowspan;

    return (
      Math.max(anchorBottom, headBottom) == this.$headCell.node(-1).childCount
    );
  }

  public static colSelection(
    $anchorCell: ResolvedPos,
    $headCell: ResolvedPos = $anchorCell
  ): CellSelection {
    const table = $anchorCell.node(-1);
    const map = TableMap.get(table);
    const tableStart = $anchorCell.start(-1);

    const anchorRect = map.findCell($anchorCell.pos - tableStart);
    const headRect = map.findCell($headCell.pos - tableStart);
    const doc = $anchorCell.node(0);

    if (anchorRect.top <= headRect.top) {
      if (anchorRect.top > 0)
        $anchorCell = doc.resolve(tableStart + map.map[anchorRect.left]);
      if (headRect.bottom < map.height)
        $headCell = doc.resolve(
          tableStart +
            map.map[map.width * (map.height - 1) + headRect.right - 1]
        );
    } else {
      if (headRect.top > 0)
        $headCell = doc.resolve(tableStart + map.map[headRect.left]);
      if (anchorRect.bottom < map.height)
        $anchorCell = doc.resolve(
          tableStart +
            map.map[map.width * (map.height - 1) + anchorRect.right - 1]
        );
    }
    return new CellSelection($anchorCell, $headCell);
  }

  public forEachCell(f: (node: Node, pos: number) => void) {
    const table = this.$anchorCell.node(-1);
    const map = TableMap.get(table);
    const tableStart = this.$anchorCell.start(-1);

    const cells = map.cellsInRect(
      map.rectBetween(
        this.$anchorCell.pos - tableStart,
        this.$headCell.pos - tableStart
      )
    );
    for (let i = 0; i < cells.length; i++) {
      f(table.nodeAt(cells[i])!, tableStart + cells[i]);
    }
  }

  public content(): Slice {
    const table = this.$anchorCell.node(-1);
    const map = TableMap.get(table);
    const tableStart = this.$anchorCell.start(-1);

    const rect = map.rectBetween(
      this.$anchorCell.pos - tableStart,
      this.$headCell.pos - tableStart
    );
    const seen: Record<number, boolean> = {};
    const rows = [];
    for (let row = rect.top; row < rect.bottom; row++) {
      const rowContent = [];
      for (
        let index = row * map.width + rect.left, col = rect.left;
        col < rect.right;
        col++, index++
      ) {
        const pos = map.map[index];
        if (seen[pos]) continue;
        seen[pos] = true;

        const cellRect = map.findCell(pos);
        let cell = table.nodeAt(pos);
        if (!cell) {
          throw RangeError(`No cell with offset ${pos} found`);
        }

        const extraLeft = rect.left - cellRect.left;
        const extraRight = cellRect.right - rect.right;

        if (extraLeft > 0 || extraRight > 0) {
          let attrs = cell.attrs as CellAttrs;
          if (extraLeft > 0) {
            attrs = removeColSpan(attrs, 0, extraLeft);
          }
          if (extraRight > 0) {
            attrs = removeColSpan(
              attrs,
              attrs.colspan - extraRight,
              extraRight
            );
          }
          if (cellRect.left < rect.left) {
            cell = cell.type.createAndFill(attrs);
            if (!cell) {
              throw RangeError(
                `Could not create cell with attrs ${JSON.stringify(attrs)}`
              );
            }
          } else {
            cell = cell.type.create(attrs, cell.content);
          }
        }
        if (cellRect.top < rect.top || cellRect.bottom > rect.bottom) {
          const attrs = {
            ...cell.attrs,
            rowspan:
              Math.min(cellRect.bottom, rect.bottom) -
              Math.max(cellRect.top, rect.top),
          };
          if (cellRect.top < rect.top) {
            cell = cell.type.createAndFill(attrs)!;
          } else {
            cell = cell.type.create(attrs, cell.content);
          }
        }
        rowContent.push(cell);
      }
      rows.push(table.child(row).copy(Fragment.from(rowContent)));
    }

    const fragment =
      this.isColSelection() && this.isRowSelection() ? table : rows;
    return new Slice(Fragment.from(fragment), 1, 1);
  }

  public static rowSelection(
    $anchorCell: ResolvedPos,
    $headCell: ResolvedPos = $anchorCell
  ): CellSelection {
    const table = $anchorCell.node(-1);
    const map = TableMap.get(table);
    const tableStart = $anchorCell.start(-1);

    const anchorRect = map.findCell($anchorCell.pos - tableStart);
    const headRect = map.findCell($headCell.pos - tableStart);
    const doc = $anchorCell.node(0);

    if (anchorRect.left <= headRect.left) {
      if (anchorRect.left > 0)
        $anchorCell = doc.resolve(
          tableStart + map.map[anchorRect.top * map.width]
        );
      if (headRect.right < map.width)
        $headCell = doc.resolve(
          tableStart + map.map[map.width * (headRect.top + 1) - 1]
        );
    } else {
      if (headRect.left > 0)
        $headCell = doc.resolve(tableStart + map.map[headRect.top * map.width]);
      if (anchorRect.right < map.width)
        $anchorCell = doc.resolve(
          tableStart + map.map[map.width * (anchorRect.top + 1) - 1]
        );
    }
    return new CellSelection($anchorCell, $headCell);
  }
  static fromJSON(doc: Node, json: CellSelectionJSON): CellSelection {
    return new CellSelection(doc.resolve(json.anchor), doc.resolve(json.head));
  }

  static create(
    doc: Node,
    anchorCell: number,
    headCell: number = anchorCell
  ): CellSelection {
    return new CellSelection(doc.resolve(anchorCell), doc.resolve(headCell));
  }

  getBookmark(): CellBookmark {
    return new CellBookmark(this.$anchorCell.pos, this.$headCell.pos);
  }
}
CellSelection.prototype.visible = false;

Selection.jsonID('cell', CellSelection);

export class CellBookmark {
  constructor(
    public anchor: number,
    public head: number
  ) {}

  map(mapping: Mappable): CellBookmark {
    return new CellBookmark(mapping.map(this.anchor), mapping.map(this.head));
  }

  resolve(doc: Node): CellSelection | Selection {
    const $anchorCell = doc.resolve(this.anchor),
      $headCell = doc.resolve(this.head);
    if (
      $anchorCell.parent.type.spec.tableRole == 'row' &&
      $headCell.parent.type.spec.tableRole == 'row' &&
      $anchorCell.index() < $anchorCell.parent.childCount &&
      $headCell.index() < $headCell.parent.childCount &&
      inSameTable($anchorCell, $headCell)
    )
      return new CellSelection($anchorCell, $headCell);
    else return Selection.near($headCell, 1);
  }
}

export function drawCellSelection(state: EditorState): DecorationSource | null {
  if (!(state.selection instanceof CellSelection)) return null;
  const cells: Decoration[] = [];
  state.selection.forEachCell((node, pos) => {
    cells.push(
      Decoration.node(pos, pos + node.nodeSize, { class: 'selectedCell' })
    );
  });

  return DecorationSet.create(state.doc, cells);
}

function isCellBoundarySelection({ $from, $to }: TextSelection) {
  if ($from.pos == $to.pos || $from.pos < $from.pos - 6) return false; // Cheap elimination
  let afterFrom = $from.pos;
  let beforeTo = $to.pos;
  let depth = $from.depth;
  for (; depth >= 0; depth--, afterFrom++)
    if ($from.after(depth + 1) < $from.end(depth)) break;
  for (let d = $to.depth; d >= 0; d--, beforeTo--)
    if ($to.before(d + 1) > $to.start(d)) break;
  return (
    afterFrom == beforeTo &&
    /row|table/.test($from.node(depth).type.spec.tableRole)
  );
}

function isTextSelectionAcrossCells({ $from, $to }: TextSelection) {
  let fromCellBoundaryNode: Node | undefined;
  let toCellBoundaryNode: Node | undefined;

  for (let i = $from.depth; i > 0; i--) {
    const node = $from.node(i);
    if (
      node.type.spec.tableRole === 'cell' ||
      node.type.spec.tableRole === 'headerCell'
    ) {
      fromCellBoundaryNode = node;
      break;
    }
  }

  for (let i = $to.depth; i > 0; i--) {
    const node = $to.node(i);
    if (
      node.type.spec.tableRole === 'cell' ||
      node.type.spec.tableRole === 'headerCell'
    ) {
      toCellBoundaryNode = node;
      break;
    }
  }

  return fromCellBoundaryNode !== toCellBoundaryNode && $to.parentOffset === 0;
}

export function normalizeSelection(
  state: EditorState,
  tr: Transaction | undefined,
  allowTableNodeSelection: boolean
) {
  const sel = (tr || state).selection;
  const doc = (tr || state).doc;
  let normalize: Selection | undefined;
  let role: string | undefined;
  if (sel instanceof NodeSelection && (role = sel.node.type.spec.tableRole)) {
    if (role == 'cell' || role == 'headerCell') {
      normalize = CellSelection.create(doc, sel.from);
    } else if (role == 'row') {
      const $cell = doc.resolve(sel.from + 1);
      normalize = CellSelection.rowSelection($cell);
    } else if (!allowTableNodeSelection) {
      const map = TableMap.get(sel.node);
      const start = sel.from + 1;
      const lastCell = start + map.map[map.width * map.height - 1];
      normalize = CellSelection.create(doc, start + 1, lastCell);
    }
  } else if (sel instanceof TextSelection && isCellBoundarySelection(sel)) {
    normalize = TextSelection.create(doc, sel.from);
  } else if (sel instanceof TextSelection && isTextSelectionAcrossCells(sel)) {
    normalize = TextSelection.create(doc, sel.$from.start(), sel.$from.end());
  }
  if (normalize) (tr || (tr = state.tr)).setSelection(normalize);
  return tr;
}
