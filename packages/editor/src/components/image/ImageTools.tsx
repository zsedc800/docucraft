import { useContext } from '@docucraft/srender';
import { nodeViewContext } from '../../utils/view';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import SvgLink from '@docucraft/icons/svg/Link';
import SvgArrowsOutward from '@docucraft/icons/svg/ArrowsOutward';
import SvgMore from '@docucraft/icons/svg/More1';
import SvgDelete from '@docucraft/icons/svg/Delete';
import SvgCopy from '@docucraft/icons/svg/ContentCopy';
import { ToggleButton } from '../../kits/ToggleButton';
import { BaseForm } from '../Form';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { AlignButton } from '../../kits/Button';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import { ListItemIcon, ListItemText } from '@mui/material';

export default function ImageTools() {
	const { nodeView } = useContext(nodeViewContext);
	const { setNodeAttribute, node, deleteNode } = nodeView;
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
				title="自适应宽高"
				onClick={() => setNodeAttribute('width', 'auto')}
			>
				<SvgArrowsOutward />
			</ToggleButton>
			<Divider orientation="vertical" flexItem variant="middle" />
			<ToggleButton
				subPanel={({ close }) => (
					<BaseForm
						style={{ padding: 8, width: '420px' }}
						onSubmit={(data) => {
							if (data.link) {
								setNodeAttribute('link', data.link);
								close();
							}
						}}
						fields={[
							{ label: '添加链接', name: 'link', defaultValue: node.attrs.link }
						]}
					>
						<Box display="flex" justifyContent="end" paddingTop={1}>
							<Button
								onClick={() => {
									if (node.attrs.link) {
										setNodeAttribute('link', null);
										close();
									}
								}}
								size="small"
								color="warning"
							>
								取消链接
							</Button>
							<Button type="submit" size="small">
								确认
							</Button>
						</Box>
					</BaseForm>
				)}
			>
				<SvgLink style={{ transform: 'rotateZ(-45deg)' }} />
			</ToggleButton>
			<Divider orientation="vertical" flexItem variant="middle" />
			<AlignButton
				align={node.attrs.align}
				onChange={(align) => setNodeAttribute('align', align)}
				filter={({ align }) => align !== 'justify'}
			/>
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
								await navigator.clipboard.writeText(node.attrs.src);
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
