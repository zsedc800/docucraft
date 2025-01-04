import { ReactNode } from 'react';
import { ListItemIcon, ListItemText, MenuItem, MenuList } from '@mui/material';
import SvgDelete from '@docucraft/icons/svg/Delete';
import { ToggleButton } from '../ToggleButton';
import Typography from '@mui/material/Typography';
interface Props {
	children: ReactNode;
}
export default ({ children }: Props) => {
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
					<MenuItem>
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
