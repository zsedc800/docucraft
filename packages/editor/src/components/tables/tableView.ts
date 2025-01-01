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
import { CellAttrs, cellAround, cellMinWidth, tableEditingKey } from './utils';
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
import Table from './Table';

export class TableView extends BaseNodeView {
	table: HTMLTableElement;
	colgroup: HTMLTableColElement;
	private $cell?: ResolvedPos;
	bottmBar: HTMLDivElement;
	rightBar: HTMLDivElement;
	constructor(
		node: Node,
		view: EditorView,
		getPos: () => number | undefined,
		public cellMinWidth: number
	) {
		console.log('table create');
		super(node, view, getPos);
		this.table = document.createElement('table');
		this.colgroup = document.createElement('colgroup');
		this.bottmBar = document.createElement('div');
		this.rightBar = document.createElement('div');
		this.component = Table;
		this.render();
		this.dom.addEventListener('mouseover', this.handleMouseMove);
	}
	handleMouseMove = (event: MouseEvent) => {
		const { clientX, clientY } = event;
		const mousePos = this.view.posAtCoords({ left: clientX, top: clientY });
		if (!mousePos) return;
		const $cell = cellAround(this.view.state.doc.resolve(mousePos.pos));
		if (!$cell) {
			//@ts-ignore
			this.rightBar.style.opacity = null;
			// @ts-ignore
			this.bottmBar.style.opacity = null;

			return;
		}
		const tableStart = $cell.start(-1);
		const map = TableMap.get(this.node);
		const { right, bottom } = map.findCell($cell.pos - tableStart);
		if (right == map.width) {
			this.rightBar.style.opacity = '1';
		}
		if (bottom == map.height) {
			this.bottmBar.style.opacity = '1';
		}

		if (bottom != map.height) {
			//@ts-ignore
			this.bottmBar.style.opacity = null;
		}

		if (right != map.width) {
			//@ts-ignore
			this.rightBar.style.opacity = null;
		}

		// this.$cell = $cell;
	};

	destroy() {
		console.log('table destroy');
		this.dom.removeEventListener('mouseover', this.handleMouseMove);
	}

	onFocusIn(): void {
		this.setProps({ selectIn: true });
	}

	onFocusOut({
		reason,
		event
	}: {
		reason: 'change' | 'blur';
		event?: FocusEvent | undefined;
	}): void {
		if (reason === 'blur' && event?.relatedTarget) return;
		this.setProps({ selectIn: false });
	}

	// ignoreMutation(record: MutationRecord): boolean {
	// 	return (
	// 		record.target !== this.table ||
	// 		(record.type == 'attributes' &&
	// 			(record.target == this.table || this.colgroup.contains(record.target)))
	// 	);
	// }
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
			const cssWidth = hasWidth ? hasWidth + 'px' : cellMinWidth + 'px';
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
	new TableView(node, view, getPos, cellMinWidth);
