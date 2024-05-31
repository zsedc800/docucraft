import { Node } from 'prosemirror-model';
import { NodeView } from 'prosemirror-view';
import createElement from '../../createElement';
import { CellAttrs } from './utils';

export class TableView implements NodeView {
  dom: HTMLDivElement;
  table: HTMLTableElement;
  colgroup: HTMLTableColElement;
  contentDOM: HTMLTableSectionElement;

  constructor(
    public node: Node,
    public cellMinWidth: number
  ) {
    this.dom = createElement('div', { class: 'tableWrapper' });
    this.table = this.dom.appendChild(createElement('table'));
    this.colgroup = this.table.appendChild(createElement('colgroup'));
    updateColumnsOnResize(
      this.node,
      this.colgroup,
      this.table,
      this.cellMinWidth
    );
    this.contentDOM = this.table.appendChild(createElement('tbody'));
  }

  update(node: Node): boolean {
    if (node.type !== this.node.type) return false;
    this.node = node;
    updateColumnsOnResize(
      this.node,
      this.colgroup,
      this.table,
      this.cellMinWidth
    );
    return true;
  }

  ignoreMutation(record: MutationRecord): boolean {
    return (
      record.type == 'attributes' &&
      (record.target == this.table || this.colgroup.contains(record.target))
    );
  }
  selectNode() {
    console.log('select', this);
  }
}

export function updateColumnsOnResize(
  node: Node,
  colgroup: HTMLTableColElement,
  table: HTMLTableElement,
  cellMinWidth: number,
  overrideCol?: number,
  overrideValue?: number
) {
  let totalWidth = 0,
    fixedWidth = true,
    nextDOM = colgroup.firstChild as HTMLElement;
  const row = node.firstChild;
  if (!row) return;

  for (let i = 0, col = 0; i < row.childCount; i++) {
    const { colspan, colwidth } = row.child(i).attrs as CellAttrs;

    for (let j = 0; j < colspan; j++, col++) {
      const hasWidth =
        overrideCol == col ? overrideValue : colwidth && colwidth[j];
      const cssWidth = hasWidth ? hasWidth + 'px' : '';
      totalWidth += hasWidth || cellMinWidth;
      if (!hasWidth) fixedWidth = false;
      if (!nextDOM) {
        colgroup.appendChild(createElement('col')).style.width = cssWidth;
      } else {
        if (nextDOM.style.width != cssWidth) nextDOM.style.width = cssWidth;
        nextDOM = nextDOM.nextSibling as HTMLElement;
      }
    }
  }

  while (nextDOM) {
    const after = nextDOM.nextSibling;
    nextDOM.parentNode?.removeChild(nextDOM);
    nextDOM = after as HTMLElement;

    if (fixedWidth) {
      table.style.width = totalWidth + 'px';
      table.style.minWidth = '';
    } else {
      table.style.width = '';
      table.style.minWidth = totalWidth + 'px';
    }
  }
}
