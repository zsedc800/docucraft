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
import { ToggleButton } from '../../kits/ToggleButton';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import { ListItemIcon, ListItemText } from '@mui/material';
import { ImageUploader } from '../../kits/Uploader';
import { ImageGalleryView } from './view';

export default function ImageTools() {
	const { nodeView } = useContext(nodeViewContext);
	const { node, deleteNode, addImage } = nodeView as ImageGalleryView;
	return (
		<Paper
			style={{
				display: 'flex',
				padding: '2px',
				marginBottom: 12,
				fontSize: '16px'
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
			<ToggleButton title="布局">
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
