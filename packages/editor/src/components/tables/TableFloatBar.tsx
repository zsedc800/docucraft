import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Switch from '@mui/material/Switch';
import SvgArrowDown from '@docucraft/icons/svg/StatMinus1';
import SvgMore from '@docucraft/icons/svg/More1';
import { AlignButton, ColorButton } from '../../kits/Button';
import { TableView } from './tableView';
import { attrsChange, toggleHeader } from './commands';
import { ToggleButton } from '../../kits/ToggleButton';
import { useState } from '@docucraft/srender';

interface Props {
	selectIn: boolean;
	nodeView: TableView;
}

export default ({ selectIn, nodeView }: Props) => {
	const { view } = nodeView;
	const [tableState, setState] = useState({
		headRow: false,
		headColumn: false
	});
	return (
		<div
			className="table-float-bar"
			onMouseDown={(e) => e.preventDefault()}
			contentEditable={false}
		>
			<Paper
				className="content"
				sx={{ display: 'flex', width: 'max-content' }}
				contentEditable={false}
			>
				<ColorButton
					// trigger="hover"
					closePanel={!selectIn}
					onChange={(val) => {
						for (const key of Object.keys(val) as (keyof typeof val)[]) {
							const value = val[key];
							if (typeof value === 'string') {
								attrsChange(key, value)(view.state, view.dispatch);
							}
						}
						nodeView.setProps({ selectIn: false });
					}}
				/>
				<Divider orientation="vertical" flexItem variant="middle" />
				<AlignButton
					// trigger="hover"
					style={{ fontSize: 18 }}
					closePanel={!selectIn}
					onChange={(align) => {
						attrsChange('textAlign', align)(view.state, view.dispatch);
						nodeView.setProps({ selectIn: false });
					}}
				/>
				<Divider orientation="vertical" flexItem variant="middle" />
				<ToggleButton
					// trigger="hover"
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
	);
};
