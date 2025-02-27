import {
	CSSProperties,
	useEffect,
	useLayoutEffect,
	useRef,
	useState
} from '@docucraft/srender';

import SvgDragIndicator from '@docucraft/icons/svg/DragIndicator';
import SvgAdd from '@docucraft/icons/svg/Add';

import { ResolvedPos } from 'prosemirror-model';
import { classnames } from '../../utils';
import { useNodeView } from '../../utils/view';
import { TableView } from './tableView';
import Popover from '../../kits/Popover';
import Menu from '../../kits/Menu';
import { addColumnAtEnd, addRowAtEnd, setCellSelection } from './commands';
import Tools from '../toolBar/Tools';
import TableMenu from './TableMenu';
import { initTableToolbars } from './toolbar';
import TableFloatBar from './TableFloatBar';

interface Props {
	nodeView: TableView;
	class: string;
	hidden: boolean;
	cols: { width: number }[];
	selectIn?: boolean;
}

export default ({
	class: className,
	nodeView,
	hidden,
	cols,
	selectIn = false
}: Props) => {
	const { $contentDOM, $dom } = useNodeView<
		HTMLDivElement,
		HTMLTableSectionElement
	>(nodeView);
	const $table = useRef<HTMLTableElement>(null);
	const $colgroup = useRef<HTMLTableColElement>(null);
	const tableContainer = useRef<HTMLDivElement>(null);
	const tableRef = useRef<{ $cell: ResolvedPos; cell: number }>(null);
	useLayoutEffect(() => {
		if ($table.current) nodeView.table = $table.current;
		if ($colgroup.current) nodeView.colgroup = $colgroup.current;
	});
	useEffect(() => initTableToolbars(nodeView, tableRef), []);

	const { view } = nodeView;
	const [shadow, setShadow] = useState({ left: false, right: false });

	const updateScroll = () => {
		if (!tableContainer.current) return;
		const { scrollLeft, scrollWidth, clientWidth } = tableContainer.current;
		setShadow({
			left: scrollLeft > 0,
			right: scrollLeft + clientWidth < scrollWidth
		});
	};

	useEffect(updateScroll, [cols]);
	const scrollbarHeight = tableContainer.current
		? tableContainer.current.offsetHeight - tableContainer.current.clientHeight
		: 0;

	const tableContent = (
		<div
			style={{ '--scrollbar-height': scrollbarHeight } as CSSProperties}
			className={classnames('tableWrapper', className, {
				hidden,
				'shadow-left': shadow.left,
				'shadow-right': shadow.right
			})}
			ref={$dom}
			data-selectin={selectIn}
		>
			<TableFloatBar nodeView={nodeView} selectIn={selectIn} />
			<div className="row-toolbar toolbar">
				<Popover
					content={(props) => (
						<TableMenu {...props} view={view} toolType="row" />
					)}
				>
					<div
						className="menu-button"
						onClick={() => {
							if (!tableRef.current) return;
							setCellSelection('row')(view, tableRef.current.cell);
						}}
					>
						<SvgDragIndicator />
					</div>
				</Popover>
			</div>
			<div className="column-toolbar toolbar">
				<Popover
					anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
					content={(props) => (
						<TableMenu {...props} view={view} toolType="column" />
					)}
				>
					<div
						className="menu-button"
						onClick={() => {
							if (!tableRef.current) return;
							setCellSelection('col')(view, tableRef.current.cell);
						}}
					>
						<SvgDragIndicator style={{ transform: 'rotateZ(90deg)' }} />
					</div>
				</Popover>
			</div>

			<Menu
				trigger="contextmenu"
				content={(props) => (
					<TableMenu {...props} view={view} toolType="contextmenu" />
				)}
			>
				<div
					ref={tableContainer}
					className={classnames('table-box')}
					onScroll={updateScroll}
				>
					<table
						ref={$table}
						style={{ width: cols.reduce((pre, cur) => pre + cur.width, 0) }}
					>
						<colgroup ref={$colgroup}>
							{cols.map(({ width }) => (
								<col style={{ width }} />
							))}
						</colgroup>
						<tbody ref={$contentDOM}></tbody>
						<div className="row-resize-handle"></div>
						<div className="column-resize-handle"></div>
					</table>
				</div>
			</Menu>
			<div
				ref={(node) => node && (nodeView.rightBar = node)}
				className={classnames('right-bar')}
				onClick={() => {
					const pos = nodeView.getPos();
					pos || pos === 0 ? addColumnAtEnd(pos, view) : void 0;
				}}
			>
				<SvgAdd />
			</div>
			<div
				ref={(node) => node && (nodeView.bottmBar = node)}
				className={classnames('bottom-bar')}
				onClick={() => {
					const pos = nodeView.getPos();
					pos || pos === 0 ? addRowAtEnd(pos, view) : void 0;
				}}
			>
				<SvgAdd />
			</div>
		</div>
	);

	return <Tools style={{ paddingRight: 10 }}>{tableContent}</Tools>;
};
