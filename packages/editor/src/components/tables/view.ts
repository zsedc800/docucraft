import { ViewMutationRecord } from 'prosemirror-view';
import { BaseNodeView } from '../../utils/view';
import { TableCell, TableHeadCell, TableRow } from './cell';
import { NodeViewParameters } from '../../interface';

export class TableRowView extends BaseNodeView {
	constructor(...[node, view, getPos]: NodeViewParameters) {
		super(node, view, getPos);
		console.log('table row create');
		// this.dom = document.createElement('tr');
		this.component = TableRow;
		this.render();
		this.contentDOM = this.dom;
	}

	ignoreMutation(mutation: ViewMutationRecord): boolean {
		return super.ignoreMutation(mutation) || mutation.type === 'attributes';
	}
}

export class TableCellView extends BaseNodeView {
	constructor(...[node, view, getPos]: NodeViewParameters) {
		super(node, view, getPos);
		console.log('table cell create');
		this.component = TableCell;
		this.render();
		this.contentDOM = this.dom;
	}
}

export class TableHeadCellView extends BaseNodeView {
	constructor(...[node, view, getPos]: NodeViewParameters) {
		super(node, view, getPos);
		console.log('table head cell create');
		this.component = TableHeadCell;
		this.render();
		this.contentDOM = this.dom;
	}
}
