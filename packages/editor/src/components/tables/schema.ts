import {
  AttributeSpec,
  Attrs,
  NodeSpec,
  Node,
  NodeType,
  Schema,
} from 'prosemirror-model';
import { CellAttrs, MutableAttrs } from './utils';

export type getFromDOM = (dom: HTMLElement) => unknown;
export type setDOMAttr = (value: unknown, attrs: MutableAttrs) => void;

export interface CellAttributes {
  default: unknown;
  getFromDOM?: getFromDOM;
  setDOMAttr?: setDOMAttr;
}

export interface TableNodesOptions {
  tableGroup?: string;
  cellContent: string;
  cellAttributes: { [k: string]: CellAttributes };
}

export type TableNodes = Record<
  'table' | 'tableRow' | 'tableCell' | 'tableHeader',
  NodeSpec
>;

const getCellAttrs = (dom: HTMLElement | string, extraAttrs: Attrs): Attrs => {
  if (typeof dom === 'string') return {} as Attrs;

  const widthAttr = dom.getAttribute('data-colwidth');
  const widths =
    widthAttr && /^\d+(,\d+)*$/.test(widthAttr)
      ? widthAttr.split(',').map(Number)
      : null;
  const colspan = Number(dom.getAttribute('colspan') || 1);
  const rowspan = Number(dom.getAttribute('rowspan') || 1);
  const result: MutableAttrs = {
    colspan,
    rowspan,
    colwidth: widths && widths.length == colspan ? widths : null,
  } satisfies CellAttrs;

  for (const prop of Object.keys(extraAttrs)) {
    const getter = extraAttrs[prop].getFromDOM;
    const value = getter && getter(dom);
    if (value !== null) result[prop] = value;
  }
  return result;
};

const setCellAttrs = (node: Node, extraAttrs: Attrs): Attrs => {
  const attrs: MutableAttrs = {};
  if (node.attrs.colspan != 1) attrs.colspan = node.attrs.colspan;
  if (node.attrs.rowspan != 1) attrs.rowspan = node.attrs.rowspan;
  if (node.attrs.colwidth)
    attrs['data-colwidth'] = node.attrs.colwidth.join(',');

  for (const prop in extraAttrs) {
    const setter = extraAttrs[prop].setDOMAttr;
    if (setter) setter(node.attrs[prop], attrs);
  }
  return attrs;
};

export const tableNodes = (options: TableNodesOptions): TableNodes => {
  const extraAttrs = options.cellAttributes || {};
  const cellAttrs: Record<string, AttributeSpec> = {
    colspan: { default: 1 },
    rowspan: { default: 1 },
    colwidth: { default: null },
  };

  for (const prop of Object.keys(extraAttrs))
    cellAttrs[prop] = { default: extraAttrs[prop].default };
  return {
    table: {
      attrs: { class: { default: '' } },
      content: 'tableRow+',
      tableRole: 'table',
      isolating: true,
      group: options.tableGroup,
      parseDOM: [
        {
          tag: 'table',
          getAttrs(dom) {
            return { class: dom.getAttribute('class') };
          },
        },
      ],
      toDOM(node) {
        return ['table', { class: node.attrs.class }, ['tbody', 0]];
      },
    },
    tableRow: {
      content: '(tableCell | tableHeader)*',
      tableRole: 'row',
      parseDOM: [{ tag: 'tr' }],
      toDOM() {
        return ['tr', 0];
      },
    },
    tableCell: {
      content: options.cellContent,
      attrs: cellAttrs,
      tableRow: 'cell',
      isolating: true,
      parseDOM: [
        { tag: 'td', getAttrs: (dom) => getCellAttrs(dom, extraAttrs) },
      ],
      toDOM(node) {
        return ['td', setCellAttrs(node, extraAttrs), 0];
      },
    },
    tableHeader: {
      content: options.cellContent,
      attrs: cellAttrs,
      tableRole: 'headerCell',
      isolating: true,
      parseDOM: [
        { tag: 'th', getAttrs: (dom) => getCellAttrs(dom, extraAttrs) },
      ],
      toDOM(node) {
        return ['th', setCellAttrs(node, extraAttrs), 0];
      },
    },
  };
};

export type TableRole = 'table' | 'row' | 'cell' | 'headerCell';

export function tableNodeTypes(schema: Schema): Record<TableRole, NodeType> {
  let result = schema.cached.tableNodeTypes;
  if (!result) {
    result = schema.cached.tableNodeTypes = {};
    for (const name in schema.nodes) {
      const type = schema.nodes[name];
      let role = type.spec.tableRole;
      if (role) result[role] = type;
    }
  }
  return result;
}
