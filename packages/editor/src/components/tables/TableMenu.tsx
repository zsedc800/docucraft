import ListItemIcon from '@mui/material/ListItemIcon';
import SvgArrowUpward from '@docucraft/icons/svg/ArrowUpward';
import SvgArrowdownward from '@docucraft/icons/svg/ArrowDownward';
import SvgArrowBack from '@docucraft/icons/svg/ArrowBack';
import SvgArrowForward from '@docucraft/icons/svg/ArrowForward';
import SvgDelete from '@docucraft/icons/svg/Delete';
import SvgClear from '@docucraft/icons/svg/CancelFill';
import Typography from '@mui/material/Typography';
import EditorView from '../../EditorView';
import { useEffect } from '@docucraft/srender';
import {
	CellSelection,
	drawCellSel,
	hasMergedCells,
	selectedRect
} from './cellSelection';
import MenuItem from '@mui/material/MenuItem';
import {
	addColumnAfter,
	addColumnBefore,
	addRowAfter,
	addRowBefore,
	clearContent,
	deleteColumn,
	deleteRow,
	deleteTable,
	mergeCells,
	splitCell
} from './commands';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import { ListItemText } from '@mui/material';

export interface TableMenuProps {
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

export default TableMenu;
