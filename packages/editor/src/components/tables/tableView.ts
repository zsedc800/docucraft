import { Node, ResolvedPos } from 'prosemirror-model';
import {
	Decoration,
	DecorationSet,
	DecorationSource,
	EditorView,
	NodeView,
	NodeViewConstructor
} from 'prosemirror-view';
import createElement, { updateElement } from '../../createElement';
import { CellAttrs, cellAround, tableEditingKey } from './utils';
import { EditorState } from 'prosemirror-state';
import { TableMap } from './tableMap';
import {
	addColumnAtEnd,
	addRowAtEnd,
	removeColumn,
	removeRow
} from './commands';
import { getView } from '../../utils';
import { BaseNodeView } from '../../utils/view';

const tableClassName = 'tableWrapper dc-block scrollbar';
export class TableView extends BaseNodeView {
	dom: HTMLDivElement;
	table: HTMLTableElement;
	colgroup: HTMLTableColElement;
	contentDOM: HTMLTableSectionElement;
	private $cell?: ResolvedPos;

	constructor(
		public node: Node,
		public view: EditorView,
		private getPos: () => number | undefined,
		public cellMinWidth: number
	) {
		console.log('table create');
		super(node, view);
		this.dom = createElement('div', {
			class: tableClassName
		});
		this.dom.appendChild(
			createElement('div', { tabindex: '0', class: 'hiddenfocus' })
		);
		this.table = this.dom.appendChild(
			createElement(
				'table'
				// {},
				// createElement('div', { class: 'rowBar' }),
				// createElement('div', { class: 'colBar' })
			)
		);
		this.colgroup = this.table.appendChild(createElement('colgroup'));
		updateColumnsOnResize(
			this.node,
			this.colgroup,
			this.table,
			this.cellMinWidth
		);
		this.contentDOM = this.table.appendChild(createElement('tbody'));
		this.dom.addEventListener('mouseover', this.handleMouseOver);
		this.dom.addEventListener('mouseleave', this.handleMouseLeave);
	}

	handleMouseOver = (event: MouseEvent) => {
		const { clientX, clientY } = event;
		const mousePos = this.view.posAtCoords({ left: clientX, top: clientY });
		if (!mousePos) return;
		const $cell = cellAround(this.view.state.doc.resolve(mousePos.pos));
		if (!$cell) return;
		// this.$cell = $cell;
		const tableStart = $cell.start(-1);
		const map = TableMap.get(this.node);
		const { left, top, right, bottom } = map.findCell($cell.pos - tableStart);
		// console.log(left, top, right, bottom, 'o');
		const decs: Decoration[] = [];
		for (let i = top; i < bottom; i++) {
			const pos = map.map[i * map.width] + tableStart;
			const $pos = this.view.state.doc.resolve(pos);
			decs.push(
				Decoration.node(pos, pos + $pos.nodeAfter!.nodeSize, {
					class: 'row-active'
				})
			);
		}

		for (let i = left; i < right; i++) {
			const pos = map.map[i] + tableStart;
			const $pos = this.view.state.doc.resolve(pos);
			decs.push(
				Decoration.node(pos, pos + $pos.nodeAfter!.nodeSize, {
					class: 'col-active'
				})
			);
		}

		let tr = this.view.state.tr;
		const classList = [];
		if (bottom == map.height) classList.push('row-active');
		if (right == map.width) classList.push('col-active');
		const pos = this.getPos()!;
		// decs.push(
		//   Decoration.node(pos, pos + this.node.nodeSize, {
		//     class: classList.join(' '),
		//   })
		// );
		// console.log(pos, 'pos');
		tr.setNodeMarkup(pos!, null, {
			...this.node.attrs,
			class: tableClassName + ' ' + classList.join(' ')
		});

		if (decs.length) {
			tr.setMeta(tableEditingKey, { hoverDecos: decs });
		}
		this.view.dispatch(tr);
	};

	handleMouseLeave = () => {
		let tr = this.view.state.tr;
		tr.setMeta(tableEditingKey, { hoverDecos: [] });
		tr.setNodeMarkup(this.getPos()!, null, {
			class: tableClassName
		});
		this.view.dispatch(tr);
	};

	destroy() {
		console.log('table destroy');

		this.dom.removeEventListener('mouseover', this.handleMouseOver);
		this.dom.removeEventListener('mouseleave', this.handleMouseLeave);
	}

	update(node: Node): boolean {
		if (!super.update(node)) return false;
		this.node = node;

		this.dom.className = node.attrs.class || tableClassName;
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

export const TableViewConstructor: NodeViewConstructor = (node, view, getPos) =>
	new TableView(node, view, getPos, 80);

export const addToolkit = (table: Node, start: number): Decoration[] => {
	const map = TableMap.get(table);
	let seen: Record<number, boolean> = {};
	const { width, height } = map;
	const result: Decoration[] = [];

	for (let i = 0; i < width * height; i += width) {
		if (seen[i]) continue;
		seen[i] = true;
		result.push(
			Decoration.widget(start + map.map[i] + 2, (view) =>
				createElement('div', {
					class: 'rowBtn',
					onclick: () => {
						const { dispatch, state } = view;
						const row = i / width;
						const table = state.doc.nodeAt(start)!;
						const map = TableMap.get(table);
						dispatch(
							removeRow(state.tr, { map, table, tableStart: start + 1 }, row)
						);
					}
				})
			)
		);
	}

	seen = {};
	for (let i = 0; i < width; i++) {
		if (seen[i]) continue;
		seen[i] = true;
		result.push(
			Decoration.widget(start + map.map[i] + 2, (view) =>
				createElement('div', {
					class: 'colBtn',
					onclick: () => {
						const { state, dispatch } = view;
						const table = state.doc.nodeAt(start)!;
						const map = TableMap.get(table);

						dispatch(
							removeColumn(state.tr, { map, table, tableStart: start + 1 }, i)
						);
					}
				})
			)
		);
	}

	result.push(
		Decoration.widget(start + 1, (view) =>
			createElement(
				'div',
				{ class: 'tools' },
				createElement(
					'div',
					{ class: 'rowBar', onclick: () => addRowAtEnd(start, view) },
					'+'
				),
				createElement(
					'div',
					{
						class: 'colBar',
						onclick: () => addColumnAtEnd(start, view)
					},
					'+'
				)
			)
		)
	);
	return result;
};
