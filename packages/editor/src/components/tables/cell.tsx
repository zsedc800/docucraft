import { Align } from '../../kits/Button';
import { useNodeView } from '../../utils/view';
import { TableRowView, TableCellView, TableHeadCellView } from './view';

interface Styles {
	textAlign: Align;
	color: string;
	backgroundColor: string;
}

export const TableRow = ({ nodeView }: { nodeView: TableRowView }) => {
	const { $dom } = useNodeView<HTMLTableRowElement>(nodeView);
	return <tr ref={$dom}></tr>;
};

export const TableCell = ({
	nodeView,
	textAlign,
	color,
	backgroundColor
}: { nodeView: TableCellView } & Styles) => {
	const { $dom } = useNodeView<HTMLTableCellElement>(nodeView);
	return <td ref={$dom} style={{ textAlign, color, backgroundColor }}></td>;
};

export const TableHeadCell = ({
	nodeView,
	textAlign,
	color,
	backgroundColor
}: {
	nodeView: TableHeadCellView;
} & Styles) => {
	const { $dom } = useNodeView<HTMLTableCellElement>(nodeView);
	return <th ref={$dom} style={{ textAlign, color, backgroundColor }}></th>;
};
