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
import { TableView } from './tableView';
import { RefObject } from '@docucraft/srender';
import { cellAround, cellMinWidth } from './utils';
import {
	addColumnAtEnd,
	addRowAtEnd,
	deleteColumnAtEnd,
	deleteRowAtEnd
} from './commands';

interface PosCtx {
	cell: number;
}

export function initTableToolbars(
	tableView: TableView,
	posCtx: RefObject<PosCtx>
) {
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
