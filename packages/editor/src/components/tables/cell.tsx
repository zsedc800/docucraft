import { Align } from '../../kits/Button';
import { classnames } from '../../utils';
import { useNodeView } from '../../utils/view';
import { TableMap } from './tableMap';
import { TableRowView, TableCellView, TableHeadCellView } from './view';

interface Styles {
	textAlign: Align;
	color: string;
	backgroundColor: string;
	colwidth: any;
	colspan: number;
	rowspan: number;
	class: string;
}

export const TableRow = ({ nodeView }: { nodeView: TableRowView }) => {
	const { $dom } = useNodeView<HTMLTableRowElement>(nodeView);
	return <tr ref={$dom}></tr>;
};

export const TableCell = ({
	nodeView,
	textAlign,
	color,
	backgroundColor,
	colspan,
	rowspan,
	colwidth,
	class: className
}: { nodeView: TableCellView } & Styles) => {
	const { $dom } = useNodeView<HTMLTableCellElement>(nodeView);

	return (
		<td
			colSpan={colspan}
			rowSpan={rowspan}
			data-colwidth={colwidth?.join(',')}
			ref={$dom}
			style={{ textAlign, color, backgroundColor }}
			className={classnames(className)}
		></td>
	);
};

export const TableHeadCell = ({
	nodeView,
	textAlign,
	color,
	backgroundColor,
	colspan,
	rowspan,
	colwidth,
	class: className
}: {
	nodeView: TableHeadCellView;
} & Styles) => {
	const { $dom } = useNodeView<HTMLTableCellElement>(nodeView);

	return (
		<th
			colSpan={colspan}
			rowSpan={rowspan}
			ref={$dom}
			style={{ textAlign, color, backgroundColor }}
			className={classnames(className)}
		></th>
	);
};
