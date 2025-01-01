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
import { cellAround, drawCellSel, pointsAtCellSelection } from './utils';
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
import SvgArrowDown from '@docucraft/icons/svg/StatMinus1';
import SvgMore from '@docucraft/icons/svg/More1';
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
	attrsChange,
	deleteColumn,
	deleteColumnAtEnd,
	deleteRow,
	deleteRowAtEnd,
	deleteTable,
	mergeCells,
	selectedRect,
	setCellSelection,
	toggleHeader
} from './commands';
import { ResolvedPos } from 'prosemirror-model';
import Paper from '@mui/material/Paper';
import Tools from '../toolBar/Tools';
import Switch from '@mui/material/Switch';
import { ToggleButton } from '../../kits/ToggleButton';
import { AlignButton } from '../../kits/Button';
import ColorButton from '../../kits/Button/ColorButton';
import { CellSelection } from './cellSelection';

interface Props {
	nodeView: TableView;
	class: string;
	hidden: boolean;
	cols: { width: number }[];
	selectIn?: boolean;
}

interface PosCtx {
	cell: number;
}

function initTableToolbars(tableView: TableView, posCtx: RefObject<PosCtx>) {
	const { view, table, dom, getPos } = tableView;
	let mousePos: ReturnType<typeof view.posAtCoords> = null;
	const rowToolbar = dom.querySelector('.row-toolbar') as HTMLElement;
	const columnToolbar = dom.querySelector('.column-toolbar') as HTMLElement;
	const tableContainer = dom.querySelector('.table-box') as HTMLElement;
	const rightBar = dom.querySelector('.right-bar') as HTMLElement;
	const bottomBar = dom.querySelector('.bottom-bar') as HTMLElement;
	const tableFloatBar = dom.querySelector('.table-float-bar') as HTMLElement;

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

		posCtx.current = { cell: mousePos.pos };
		const cellDOM = view.nodeDOM($cell.pos) as HTMLTableRowElement;
		const { top: offsetTop, left: offsetLeft } = table.getBoundingClientRect();
		if (!cellDOM) return;

		rowToolbar.style.display = 'flex';
		columnToolbar.style.display = 'flex';
		const { height, top, width, left } = cellDOM.getBoundingClientRect();
		const { scrollLeft, scrollTop } = tableContainer;

		rowToolbar.style.height = height + 'px';
		rowToolbar.style.transform = `translate(0, ${top - offsetTop - scrollTop}px)`;
		columnToolbar.style.width = width + 'px';
		columnToolbar.style.transform = `translate(${left - offsetLeft - scrollLeft}px, 0)`;
	}

	function updateBottomBar(e: MouseEvent) {
		const win = view.dom.ownerDocument.defaultView ?? window;
		let startY = e.clientY;
		function move(event: MouseEvent) {
			const offsetY = event.clientY - startY;
			bottomBar.style.opacity = '1';
			bottomBar.style.transform = `translate(0, ${offsetY}px)`;
			const pos = getPos();

			if (offsetY > 30 && (pos || pos === 0)) {
				startY = event.clientY;
				addRowAtEnd(pos, view);
				bottomBar.style.opacity = null as any;
				bottomBar.style.transform = 'none';
			}

			if (offsetY < -30 && (pos || pos === 0)) {
				startY = event.clientY;
				deleteRowAtEnd(view, pos);
				bottomBar.style.opacity = null as any;
				bottomBar.style.transform = 'none';
			}
		}

		function finish() {
			bottomBar.style.opacity = null as any;
			bottomBar.style.transform = 'none';
			win.removeEventListener('mousemove', move);
			win.removeEventListener('mouseup', finish);
		}
		win.addEventListener('mousemove', move);
		win.addEventListener('mouseup', finish);
		e.preventDefault();
		e.stopPropagation();
	}

	function updateRightBar(e: MouseEvent) {
		const win = view.dom.ownerDocument.defaultView ?? window;
		let startX = e.clientX;
		function move(event: MouseEvent) {
			const offsetX = event.clientX - startX;
			rightBar.style.opacity = '1';
			rightBar.style.transform = `translate(${offsetX}px, 0)`;
			const pos = getPos();

			if (offsetX > 50 && (pos || pos === 0)) {
				startX = event.clientX;
				addColumnAtEnd(pos, view);
				rightBar.style.opacity = null as any;
				rightBar.style.transform = 'none';
			}

			if (offsetX < -50 && (pos || pos === 0)) {
				startX = event.clientX;
				deleteColumnAtEnd(view, pos);
				rightBar.style.opacity = null as any;
				rightBar.style.transform = 'none';
			}
		}

		function finish() {
			rightBar.style.opacity = null as any;
			rightBar.style.transform = 'none';
			win.removeEventListener('mousemove', move);
			win.removeEventListener('mouseup', finish);
		}
		win.addEventListener('mousemove', move);
		win.addEventListener('mouseup', finish);
		e.preventDefault();
		e.stopPropagation();
	}

	bottomBar.addEventListener('mousedown', updateBottomBar);
	rightBar.addEventListener('mousedown', updateRightBar);

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
	event?: MouseEvent | null;
}

const TableMenu = ({ view, toolType, close, event }: TableMenuProps) => {
	const handler = (fn: () => void) => () => {
		fn();
		close();
		if (toolType === 'contextmenu') view.focus();
	};
	const [isInCellSel, setCellSel] = useState(false);
	console.log(event, 'ee');

	useEffect(() => {
		if (
			event &&
			pointsAtCellSelection(view, { x: event.clientX, y: event.clientY })
		) {
			setCellSel(true);
		} else {
			setCellSel(false);
		}
		window.getSelection()?.removeAllRanges();
	}, [event]);

	const rect = selectedRect(view.state);

	let inCellSelContent;
	if (isInCellSel) {
		inCellSelContent = (
			<MenuItem
				onClick={() => {
					mergeCells(view.state, view.dispatch);
				}}
			>
				<ListItemIcon className="icon" />
				合并单元格
			</MenuItem>
		);
	}

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
					{inCellSelContent}
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
	useEffect(() => {
		return initTableToolbars(nodeView, tableRef);
	}, []);

	const { view } = nodeView;
	const [shadow, setShadow] = useState({ left: false, right: false });
	const [tableState, setState] = useState({
		headRow: false,
		headColumn: false
	});

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
			<div className="table-float-bar" contentEditable={false}>
				<Paper className="content" sx={{ display: 'flex' }}>
					<ColorButton
						trigger="hover"
						closePanel={!selectIn}
						onChange={(val) => {
							for (const key of Object.keys(val) as (keyof typeof val)[]) {
								const value = val[key];
								if (typeof value === 'string') {
									attrsChange(key, value)(view.state, view.dispatch);
								}
							}
						}}
					/>
					<Divider orientation="vertical" flexItem variant="middle" />
					<AlignButton
						trigger="hover"
						style={{ fontSize: 18 }}
						closePanel={!selectIn}
						onChange={(align) => {
							attrsChange('textAlign', align)(view.state, view.dispatch);
						}}
					/>
					<Divider orientation="vertical" flexItem variant="middle" />
					<ToggleButton
						trigger="hover"
						slotProps={{
							paper: {
								sx: { width: '210px', borderRadius: '8px' }
							}
						}}
						subPanel={
							!selectIn ? null : (
								<MenuList dense>
									<MenuItem>
										<ListItemText>标题行</ListItemText>
										<Switch
											onChange={() =>
												toggleHeader('row')(view.state, view.dispatch) &&
												setState({
													...tableState,
													headRow: !tableState.headRow
												})
											}
											checked={tableState.headRow}
											size="small"
										/>
									</MenuItem>
									<MenuItem>
										<ListItemText>标题列</ListItemText>
										<Switch
											onChange={() =>
												toggleHeader('column')(view.state, view.dispatch) &&
												setState({
													...tableState,
													headColumn: !tableState.headColumn
												})
											}
											checked={tableState.headColumn}
											size="small"
										/>
									</MenuItem>
								</MenuList>
							)
						}
						IconComponent={SvgArrowDown}
					>
						选项
					</ToggleButton>

					<Divider orientation="vertical" flexItem variant="middle" />
					<div role="button">
						<SvgMore />
					</div>
				</Paper>
			</div>

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
