import { BaseNodeView, getNodeView } from '../../utils/view';
import { TableCell, TableHeadCell, TableRow } from './cell';
import { NodeViewParameters } from '../../interface';

export class TableRowView extends BaseNodeView {
	constructor(...[node, view, getPos]: NodeViewParameters) {
		super(node, view, getPos);
		this.component = TableRow;
		this.render();
		this.contentDOM = this.dom;
	}
}

export class TableCellView extends BaseNodeView {
	constructor(...[node, view, getPos]: NodeViewParameters) {
		super(node, view, getPos);
		this.component = TableCell;
		this.render();
		this.contentDOM = this.dom;
	}
}

export class TableHeadCellView extends BaseNodeView {
	constructor(...[node, view, getPos]: NodeViewParameters) {
		super(node, view, getPos);
		this.component = TableHeadCell;
		this.render();
		this.contentDOM = this.dom;
	}
}
