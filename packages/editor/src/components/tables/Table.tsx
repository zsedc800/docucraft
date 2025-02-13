import {
	CSSProperties,
	RefObject,
	useEffect,
	useLayoutEffect,
	useRef,
	useState
} from '@docucraft/srender';
import { EditorView } from 'prosemirror-view';
import SvgDragIndicator from '@docucraft/icons/svg/DragIndicator';
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
import { ResolvedPos } from 'prosemirror-model';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import { classnames } from '../../utils';
import { useNodeView } from '../../utils/view';
import { TableView } from './tableView';
import { cellAround, cellMinWidth } from './utils';
import Popover from '../../kits/Popover';
import Menu from '../../kits/Menu';
import {
	addColumnAfter,
	addColumnAtEnd,
	addColumnBefore,
	addRowAfter,
	addRowAtEnd,
	addRowBefore,
	attrsChange,
	clearContent,
	deleteColumn,
	deleteColumnAtEnd,
	deleteRow,
	deleteRowAtEnd,
	deleteTable,
	mergeCells,
	setCellSelection,
	splitCell,
	toggleHeader
} from './commands';
import Tools from '../toolBar/Tools';
import { ToggleButton } from '../../kits/ToggleButton';
import { AlignButton } from '../../kits/Button';
import ColorButton from '../../kits/Button/ColorButton';
import {
	CellSelection,
	drawCellSel,
	hasMergedCells,
	selectedRect
} from './cellSelection';
import { TableMap } from './tableMap';
import {
	Direction,
	getResizingCellDOM,
	getResizingPos,
	handleMouseDown,
	isResizing,
	setResizingCellDOM,
	setResizingPos
} from './resizing';

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
	let mousedown = false,
		dir: Direction = 'vertical';
	const rowToolbar = dom.querySelector('.row-toolbar') as HTMLElement;
	const columnToolbar = dom.querySelector('.column-toolbar') as HTMLElement;
	const tableContainer = dom.querySelector('.table-box') as HTMLElement;
	const rightBar = dom.querySelector('.right-bar') as HTMLElement;
	const bottomBar = dom.querySelector('.bottom-bar') as HTMLElement;
	const tableFloatBar = dom.querySelector('.table-float-bar') as HTMLElement;
	const rowResizeHandler = dom.querySelector(
		'.row-resize-handle'
	) as HTMLElement;
	const colResizeHandler = dom.querySelector(
		'.column-resize-handle'
	) as HTMLElement;

	// 更新工具条位置和尺寸
	function updateToolbars(event: MouseEvent) {
		if (!mousePos) return;
		const $cell = cellAround(view.state.doc.resolve(mousePos.pos));
		if (!$cell) {
			rowToolbar.style.display = 'none';
			columnToolbar.style.display = 'none';
			rowResizeHandler.style.display = 'none';
			colResizeHandler.style.display = 'none';
			dom.classList.remove('column-resize-cursor');
			dom.classList.remove('row-resize-cursor');
			setResizingPos(-1);
			if (rowToolbar.matches(':hover')) rowToolbar.style.display = 'flex';
			if (columnToolbar.matches(':hover')) columnToolbar.style.display = 'flex';

			return;
		}

		posCtx.current = { cell: mousePos.pos };
		const cellDOM = view.nodeDOM($cell.pos) as HTMLTableRowElement;
		const { top: offsetTop, left: offsetLeft } = table.getBoundingClientRect();
		if (!cellDOM) return;

		const { height, top, width, left, bottom, right } =
			cellDOM.getBoundingClientRect();

		rowToolbar.style.display = 'flex';
		columnToolbar.style.display = 'flex';
		const { scrollLeft, scrollTop } = tableContainer;

		rowToolbar.style.height = height + 'px';
		rowToolbar.style.transform = `translate(0, ${top - offsetTop - scrollTop}px)`;
		columnToolbar.style.width = width + 'px';
		columnToolbar.style.transform = `translate(${left - offsetLeft - scrollLeft}px, 0)`;

		const map = TableMap.get($cell.node(-1)),
			start = $cell.start(-1);
		const index = map.map.indexOf($cell.pos - start);
		let cellPos = $cell.pos;

		const showResizeHandler = (type: 'col' | 'row' | 'clear') => {
			if (type === 'col') {
				dir = 'vertical';
				colResizeHandler.style.display = 'block';
				rowResizeHandler.style.display = 'none';
				dom.classList.add('column-resize-cursor');
				dom.classList.remove('row-resize-cursor');
			} else if (type === 'row') {
				dir = 'horizontal';
				rowResizeHandler.style.display = 'block';
				colResizeHandler.style.display = 'none';
				dom.classList.add('row-resize-cursor');
				dom.classList.remove('column-resize-cursor');
			} else {
				dir = 'none';
				rowResizeHandler.style.display = 'none';
				colResizeHandler.style.display = 'none';
				dom.classList.remove('column-resize-cursor');
				dom.classList.remove('row-resize-cursor');
			}
		};

		const handleMove = () => {
			if (isResizing()) return;

			setResizingCellDOM(cellDOM);
			if (right - event.clientX <= 5) {
				showResizeHandler('col');
			} else if (event.clientX - left <= 5) {
				let n;
				cellPos = start + map.map[index - 1];
				if (
					index % map.width !== 0 &&
					(n = view.nodeDOM(cellPos) as HTMLElement)
				) {
					setResizingCellDOM(n);
					showResizeHandler('col');
				} else cellPos = -1;
			} else if (bottom - event.clientY <= 5) {
				showResizeHandler('row');
			} else if (event.clientY - top <= 5) {
				let n;
				cellPos = start + map.map[index - width];
				if (
					Math.floor(index / map.width) > 0 &&
					(n = view.nodeDOM(cellPos) as HTMLElement)
				) {
					setResizingCellDOM(n);
					showResizeHandler('row');
				} else cellPos = -1;
			} else cellPos = -1;
			setResizingPos(cellPos);
			if (cellPos === -1) {
				showResizeHandler('clear');
			}
		};

		const onDragMove = () => {
			const cellDOM = getResizingCellDOM();
			if (!cellDOM) return;
			const { right, bottom } = cellDOM.getBoundingClientRect();
			if (dir === 'vertical') {
				colResizeHandler.style.left =
					right - offsetLeft - scrollLeft - 1 + 'px';
			} else if (dir === 'horizontal') {
				rowResizeHandler.style.top = bottom - offsetTop - scrollTop - 1 + 'px';
			}
		};

		handleMove();

		onDragMove();
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

	const onMouseDown = (e: MouseEvent) => {
		if (getResizingPos() > -1) mousedown = true;
		return handleMouseDown(view, e, cellMinWidth, dir);
	};
	const onMouseUp = (e: MouseEvent) => {
		mousedown = false;
	};
	const onMouseMove = (event: MouseEvent) => {
		const { clientX, clientY } = event;
		mousePos = view.posAtCoords({ left: clientX, top: clientY });
		if (!mousePos) return;
		updateToolbars(event);
	};

	view.dom.addEventListener('mousedown', onMouseDown);
	view.dom.addEventListener('mousemove', onMouseMove);
	view.dom.addEventListener('mouseup', onMouseUp);

	return () => {
		view.dom.removeEventListener('mousemove', onMouseMove);
		view.dom.removeEventListener('mousedown', onMouseDown);
		view.dom.removeEventListener('mouseup', onMouseUp);
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

	useEffect(() => {
		window.getSelection()?.removeAllRanges();
	}, [event]);

	const rect = selectedRect(view.state);
	const mergeStatus = hasMergedCells(view.state);
	let inCellSelContent;
	const opCells = [
		view.state.selection instanceof CellSelection &&
			(mergeStatus === 'hasMerged' || mergeStatus === 'none') && (
				<MenuItem
					onClick={handler(() => mergeCells(view.state, view.dispatch))}
				>
					<ListItemIcon className="icon" />
					合并单元格
				</MenuItem>
			),
		(mergeStatus === 'onlyMerged' || mergeStatus === 'hasMerged') && (
			<MenuItem onClick={handler(() => splitCell(view.state, view.dispatch))}>
				<ListItemIcon className="icon" />
				拆分单元格
			</MenuItem>
		)
	].filter(Boolean);
	inCellSelContent = (
		<>
			{opCells.length > 0 && <Divider />}
			{opCells}
		</>
	);

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
			<MenuItem
				onClick={handler(() => clearContent(view.state, view.dispatch))}
			>
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
				<Paper
					className="content"
					sx={{ display: 'flex', width: 'max-content' }}
				>
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
