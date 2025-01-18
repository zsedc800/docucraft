import { useContext } from '@docucraft/srender';
import { nodeViewContext } from '../../utils/view';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import SvgArrowsOutward from '@docucraft/icons/svg/ArrowsOutward';
import SvgMore from '@docucraft/icons/svg/More1';
import SvgDelete from '@docucraft/icons/svg/Delete';
import SvgCopy from '@docucraft/icons/svg/ContentCopy';
import SvgAdd from '@docucraft/icons/svg/Add';
import SvgGrid from '@docucraft/icons/svg/GridView';
import SvgQuilt from '@docucraft/icons/svg/ViewQuilt';
import SvgSpaceDashboard from '@docucraft/icons/svg/SpaceDashboard';
import SvgWave from '@docucraft/icons/svg/Waves';
import { ToggleButton, ToggleButtonGroup } from '../../kits/ToggleButton';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import { ListItemIcon, ListItemText } from '@mui/material';
import { ImageUploader } from '../../kits/Uploader';
import { ImageGalleryView } from './view';

function LayouButton({
	value,
	onChange
}: {
	value: any;
	onChange?: (e: any) => void;
}) {
	return (
		<ToggleButtonGroup
			style={{ fontSize: 20 }}
			value={value}
			onChange={onChange}
		>
			<ToggleButton title="quited" value="quilted">
				<SvgQuilt />
			</ToggleButton>
			<ToggleButton title="Grid" value="standard">
				<SvgSpaceDashboard />
			</ToggleButton>
			<ToggleButton title="woven" value="woven">
				<SvgWave />
			</ToggleButton>
		</ToggleButtonGroup>
	);
}

export default function ImageTools() {
	const { nodeView } = useContext(nodeViewContext);
	const { node, deleteNode, addImage, setNodeAttribute } =
		nodeView as ImageGalleryView;
	return (
		<Paper
			style={{
				display: 'flex',
				padding: '2px',
				fontSize: '16px',
				marginBottom: 6
			}}
		>
			<ToggleButton
				title="添加图片"
				IconComponent={() => null}
				subPanel={({ close }) => (
					<ImageUploader
						onChange={(src) => {
							addImage(src);
							close();
						}}
					/>
				)}
			>
				<SvgAdd />
			</ToggleButton>
			<ToggleButton
				IconComponent={() => null}
				subPanel={
					<LayouButton
						value={node.attrs.layout}
						onChange={(v) => setNodeAttribute('layout', v)}
					/>
				}
				title="布局"
			>
				<SvgGrid />
			</ToggleButton>
			<Divider orientation="vertical" flexItem variant="middle" />
			<ToggleButton
				IconComponent={() => null}
				subPanel={({ close }) => (
					<MenuList>
						<MenuItem
							onClick={() => {
								deleteNode();
								close();
							}}
						>
							<SvgDelete style={{ fontSize: 16, marginRight: 2 }} />
							<ListItemText>删除</ListItemText>
						</MenuItem>
						<MenuItem
							onClick={async () => {
								await navigator.clipboard.writeText(node.attrs.images);
							}}
						>
							<SvgCopy style={{ fontSize: 16, marginRight: 2 }} />
							<ListItemText>复制</ListItemText>
						</MenuItem>
					</MenuList>
				)}
			>
				<SvgMore />
			</ToggleButton>
		</Paper>
	);
}
