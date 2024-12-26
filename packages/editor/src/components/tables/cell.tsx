import { useNodeView } from '../../utils/view';
import { TableRowView, TableCellView, TableHeadCellView } from './view';

export const TableRow = ({ nodeView }: { nodeView: TableRowView }) => {
	const { $dom } = useNodeView<HTMLTableRowElement>(nodeView);
	return <tr ref={$dom}></tr>;
};

export const TableCell = ({ nodeView }: { nodeView: TableCellView }) => {
	const { $dom } = useNodeView<HTMLTableCellElement>(nodeView);
	return <td ref={$dom}></td>;
};

export const TableHeadCell = ({
	nodeView
}: {
	nodeView: TableHeadCellView;
}) => {
	const { $dom } = useNodeView<HTMLTableCellElement>(nodeView);
	return <th ref={$dom}></th>;
};
