import ListItemIcon, { listItemIconClasses } from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import SvgDelete from '@docucraft/icons/svg/Delete';
import SvgCopy from '@docucraft/icons/svg/ContentCopy';
import SvgSwap from '@docucraft/icons/svg/SwapHoriz';
import SvgPalette from '@docucraft/icons/svg/Palette';
import SvgArrowRight from '@docucraft/icons/svg/ChevronRight';
import { ReactNode, useContext } from '@docucraft/srender';
import { ToggleButton } from '../ToggleButton';
import { BaseNodeView, nodeViewContext } from '../../utils/view';
import Toast from '../../components/Toast';
import Menu from '../Menu';
import ColorMark from '../ColorMark';
import { MenuItemConfig } from '../../interface';
import TransformBlock from '../ComponentsPanel/TransformBlock';
export type ExtraCmpProps = {
	nodeView: BaseNodeView;
};

interface Props {
	children: ReactNode;
	extraMenu?: (e: ExtraCmpProps) => ReactNode;
	close?: () => void;
}

export type OPMenuProps = Props;

export const defaultItems: MenuItemConfig[] = [
	{
		title: '删除',
		Icon: SvgDelete,
		handler(nodeView) {
			nodeView.deleteNode();
		}
	},
	{
		title: '复制',
		Icon: SvgCopy,
		handler(nodeView) {
			navigator.clipboard
				.writeText(nodeView.node.textContent)
				.then(() => Toast.success('已复制'));
		}
	}
];

export const ColorPalette = ({ nodeView }: ExtraCmpProps) => {
	return (
		<Menu
			placement="right-start"
			content={
				<ColorMark
					onChange={({ color, bgColor }) => {
						nodeView.setNodeAttributes({ color, bgColor });
						close?.();
					}}
					footer={null}
				/>
			}
		>
			<MenuItem>
				<ListItemIcon>
					<SvgPalette />
				</ListItemIcon>
				<ListItemText>颜色</ListItemText>
				<SvgArrowRight />
			</MenuItem>
		</Menu>
	);
};

export default ({ children, close, extraMenu }: Props) => {
	const { nodeView } = useContext(nodeViewContext);
	return (
		<ToggleButton
			title={
				<Typography textAlign="center">
					按住可以拖动
					<br />
					点击展开更多
				</Typography>
			}
			maskProps={{}}
			IconComponent={() => null}
			slotProps={{ paper: { style: { width: 120, borderRadius: 10 } } }}
			onMouseEnter={() => nodeView.setProps({ selected: true })}
			// onMouseLeave={() => nodeView.setProps({ selected: false })}
			onClick={() => nodeView.selectNode()}
			onClose={() => {
				close && close();
				nodeView.deselectNode();
			}}
			subPanel={
				<MenuList
					sx={() => ({
						'& .MuiListItemIcon-root': {
							minWidth: '20px !important'
						}
					})}
				>
					<MenuItem
						onClick={() => {
							close?.();
							nodeView.deleteNode();
						}}
					>
						<ListItemIcon>
							<SvgDelete />
						</ListItemIcon>
						<ListItemText>删除</ListItemText>
					</MenuItem>
					<MenuItem
						onClick={() => {
							navigator.clipboard
								.writeText(nodeView.node.textContent)
								.then(() => Toast.success('已复制'))
								.then(close);
						}}
					>
						<ListItemIcon>
							<SvgCopy />
						</ListItemIcon>
						<ListItemText>复制</ListItemText>
					</MenuItem>
					<Menu
						placement="right-start"
						content={
							<TransformBlock
								style={{ marginLeft: 8 }}
								nodeView={nodeView}
								close={close}
							/>
						}
					>
						<MenuItem>
							<ListItemIcon>
								<SvgSwap />
							</ListItemIcon>
							<ListItemText>转换</ListItemText>
							<SvgArrowRight />
						</MenuItem>
					</Menu>

					{extraMenu && (
						<>
							<Divider />
							{extraMenu({ nodeView })}
						</>
					)}
				</MenuList>
			}
		>
			{children}
		</ToggleButton>
	);
};
