import {
	CSSProperties,
	RefObject,
	useEffect,
	useLayoutEffect,
	useRef,
	useState
} from '@docucraft/srender';
import { classnames, nextTick } from '../../utils';
import { useNodeView } from '../../utils/view';
import { TableView } from './tableView';
import { cellAround, drawCellSel } from './utils';
import { EditorView } from 'prosemirror-view';
import SvgDragIndicator from '@docucraft/icons/svg/DragIndicator';
import Popover from '../../kits/Popover';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SvgArrowUpward from '@docucraft/icons/svg/ArrowUpward';
import SvgArrowdownward from '@docucraft/icons/svg/ArrowDownward';
import SvgArrowBack from '@docucraft/icons/svg/ArrowBack';
import SvgArrowForward from '@docucraft/icons/svg/ArrowForward';
import SvgDelete from '@docucraft/icons/svg/Delete';
import SvgClear from '@docucraft/icons/svg/CancelFill';
import SvgAdd from '@docucraft/icons/svg/Add';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Menu from '../../kits/Menu';
import {
	addColumnAfter,
	addColumnAtEnd,
	addColumnBefore,
	addRowAfter,
	addRowAtEnd,
	addRowBefore,
	deleteColumn,
	deleteRow,
	deleteTable,
	selectedRect
} from './commands';
import { CellSelection } from './cellSelection';
import { ResolvedPos } from 'prosemirror-model';

interface Props {
	nodeView: TableView;
	class: string;
	hidden: boolean;
	cols: { width: number }[];
}

function initTableToolbars(
	tableView: TableView,
	posCtx: RefObject<{ $cell: ResolvedPos }>
) {
	const { view, table, dom } = tableView;
	let mousePos: ReturnType<typeof view.posAtCoords> = null;
	const rowToolbar = dom.querySelector('.row-toolbar') as HTMLElement;
	const columnToolbar = dom.querySelector('.column-toolbar') as HTMLElement;
	const tableContainer = dom.querySelector('.table-box') as HTMLElement;
	// 更新工具条位置和尺寸
	function updateToolbars() {
		if (!mousePos) return;
		const $cell = cellAround(view.state.doc.resolve(mousePos.pos));
		if (!$cell) {
			rowToolbar.style.display = 'none';
			columnToolbar.style.display = 'none';
			if (rowToolbar.matches(':hover')) rowToolbar.style.display = 'flex';
			if (columnToolbar.matches(':hover')) columnToolbar.style.display = 'flex';

			return;
		}

		// const tableStart = $cell.start(-1);
		// const map = TableMap.get(tableView.node);
		// const rect  = map.findCell($cell.pos - tableStart);
		posCtx.current = { $cell };
		const cellDOM = view.nodeDOM($cell.pos) as HTMLTableRowElement;
		const { top: offsetTop, left: offsetLeft } = table.getBoundingClientRect();
		if (!cellDOM) return;

		rowToolbar.style.display = 'flex';
		columnToolbar.style.display = 'flex';
		// if ($cell.pos === posCtx.current?.$cell.pos) return;
		const { height, top, width, left } = cellDOM.getBoundingClientRect();
		const { scrollLeft, scrollTop } = tableContainer;

		rowToolbar.style.height = height + 'px';
		rowToolbar.style.transform = `translate(0, ${top - offsetTop - scrollTop}px)`;
		columnToolbar.style.width = width + 'px';
		columnToolbar.style.transform = `translate(${left - offsetLeft - scrollLeft}px, 0)`;
	}

	view.dom.addEventListener('mousemove', (event: MouseEvent) => {
		const { clientX, clientY } = event;
		mousePos = view.posAtCoords({ left: clientX, top: clientY });
		if (!mousePos) return;
		updateToolbars();
	});

	return () => {
		view.dom.removeEventListener('mousemove', updateToolbars);
	};
}

interface TableMenuProps {
	view: EditorView;
	toolType: 'row' | 'column' | 'contextmenu';
	close: () => void;
}

const TableMenu = ({ view, toolType, close }: TableMenuProps) => {
	const handler = (fn: () => void) => () => {
		fn();
		close();
		view.focus();
	};
	const rect = selectedRect(view.state);
	return (
		<MenuList
			sx={{
				'.icon.MuiListItemIcon-root': {
					minWidth: '28px',
					fontSize: '20px'
				},
				width: '180px'
			}}
		>
			{toolType !== 'column' && (
				<>
					<MenuItem
						onClick={handler(() =>
							addRowBefore(view.state, view.dispatch, view)
						)}
					>
						<ListItemIcon className="icon">
							<SvgArrowUpward />
						</ListItemIcon>
						<ListItemText>向上插入1行</ListItemText>
					</MenuItem>

					<MenuItem
						onClick={handler(() =>
							addRowAfter(view.state, view.dispatch, view)
						)}
					>
						<ListItemIcon className="icon">
							<SvgArrowdownward />
						</ListItemIcon>
						<ListItemText>向下插入1行</ListItemText>
					</MenuItem>
				</>
			)}

			{toolType !== 'row' && (
				<>
					<MenuItem
						onClick={handler(() =>
							addColumnBefore(view.state, view.dispatch, view)
						)}
					>
						<ListItemIcon className="icon">
							<SvgArrowBack />
						</ListItemIcon>
						<ListItemText>向左插入1列</ListItemText>
					</MenuItem>
					<MenuItem
						onClick={handler(() =>
							addColumnAfter(view.state, view.dispatch, view)
						)}
					>
						<ListItemIcon className="icon">
							<SvgArrowForward />
						</ListItemIcon>
						<ListItemText>向右插入1列</ListItemText>
					</MenuItem>
				</>
			)}
			<MenuItem>
				<ListItemIcon className="icon">
					<SvgClear />
				</ListItemIcon>
				<ListItemText>清除内容</ListItemText>
			</MenuItem>
			{toolType === 'contextmenu' ? (
				<>
					<Divider />
					{rect.map.height > 1 && (
						<MenuItem
							onMouseLeave={() => drawCellSel(view, 'clear')}
							onMouseEnter={() => drawCellSel(view, 'row')}
							onClick={handler(() => deleteRow(view.state, view.dispatch))}
						>
							<ListItemIcon className="icon" />
							删除所在行
						</MenuItem>
					)}
					{rect.map.width > 1 && (
						<MenuItem
							onMouseLeave={() => drawCellSel(view, 'clear')}
							onMouseEnter={() => drawCellSel(view, 'col')}
							onClick={handler(() => deleteColumn(view.state, view.dispatch))}
						>
							<ListItemIcon className="icon" />
							删除所在列
						</MenuItem>
					)}
					<MenuItem
						onMouseLeave={() => drawCellSel(view, 'clear')}
						onMouseEnter={() => drawCellSel(view, 'all')}
						onClick={handler(() => deleteTable(view.state, view.dispatch))}
					>
						<ListItemIcon className="icon" />
						删除表格
					</MenuItem>
				</>
			) : (
				<>
					<MenuItem
						onClick={handler(() =>
							toolType === 'column'
								? deleteColumn(view.state, view.dispatch)
								: deleteRow(view.state, view.dispatch)
						)}
					>
						<ListItemIcon className="icon">
							<SvgDelete />
						</ListItemIcon>
						<ListItemText>删除</ListItemText>
						<Typography variant="body2" sx={{ color: 'text.secondary' }}>
							Del
						</Typography>
					</MenuItem>
				</>
			)}
		</MenuList>
	);
};

export default ({ class: className, nodeView, hidden, cols }: Props) => {
	const { $contentDOM, $dom } = useNodeView<
		HTMLDivElement,
		HTMLTableSectionElement
	>(nodeView);
	const $table = useRef<HTMLTableElement>(null);
	const $colgroup = useRef<HTMLTableColElement>(null);
	const tableContainer = useRef<HTMLDivElement>(null);
	const tableRef = useRef<{ $cell: ResolvedPos }>(null);
	useLayoutEffect(() => {
		if ($table.current) nodeView.table = $table.current;
		if ($colgroup.current) nodeView.colgroup = $colgroup.current;
	});
	useEffect(() => {
		return initTableToolbars(nodeView, tableRef);
	}, []);
	const { node, view } = nodeView;
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

	return (
		<div
			style={{ '--scrollbar-height': scrollbarHeight } as CSSProperties}
			className={classnames('tableWrapper', className, {
				hidden,
				'shadow-left': shadow.left,
				'shadow-right': shadow.right
			})}
			ref={$dom}
			contentEditable={false}
		>
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
							const sel = CellSelection.rowSelection(tableRef.current.$cell);
							view.dispatch(view.state.tr.setSelection(sel));
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
							const sel = CellSelection.colSelection(tableRef.current.$cell);
							view.dispatch(view.state.tr.setSelection(sel));
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
						contentEditable
						style={{ width: cols.reduce((pre, cur) => pre + cur.width, 0) }}
					>
						<colgroup ref={$colgroup}>
							{cols.map(({ width }) => (
								<col style={{ width }} />
							))}
						</colgroup>
						<tbody ref={$contentDOM}></tbody>
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
};
