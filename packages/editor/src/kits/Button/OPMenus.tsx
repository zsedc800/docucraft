import { ReactNode } from 'react';
import { ListItemIcon, ListItemText, MenuItem, MenuList } from '@mui/material';
import SvgDelete from '@docucraft/icons/svg/Delete';
import { ToggleButton } from '../ToggleButton';
import Typography from '@mui/material/Typography';
import { useContext } from '@docucraft/srender';
import { nodeViewContext } from '../../utils/view';
interface Props {
	children: ReactNode;
	close?: () => void;
}
export default ({ children, close }: Props) => {
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
			slotProps={{ paper: { style: { width: 210 } } }}
			subPanel={
				<MenuList>
					<MenuItem
						onClick={() => {
							console.log(close, 'xxx');
							close?.();
							nodeView.deleteNode();
						}}
					>
						<ListItemIcon>
							<SvgDelete />
						</ListItemIcon>
						<ListItemText>删除</ListItemText>
					</MenuItem>
				</MenuList>
			}
		>
			{children}
		</ToggleButton>
	);
};
