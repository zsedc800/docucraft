import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import { CSSProperties } from '@docucraft/srender';
import Icon from '@docucraft/icons';
import SvgMore from '@docucraft/icons/svg/More1';
import SvgPalette from '@docucraft/icons/svg/Palette';
import { useNodeView } from '../../utils/view';
import Tools from '../toolBar/Tools';
import { EmphasisView } from './view';
import { IconPicker, PickerValue } from '../../kits/Picker';
import Menu from '../../kits/Menu';
import { ToggleButton } from '../../kits/ToggleButton';
import ColorMark from '../../kits/ColorMark';
import { ColorPalette } from '../../kits/Button/OPMenus';
import './style.scss';

interface Props {
	nodeView: EmphasisView;
	icon: PickerValue;
	color: string;
	bgColor: string;
	borderColor: string;
}
export default ({ nodeView, icon, color, bgColor, borderColor }: Props) => {
	const { $dom, $contentDOM } = useNodeView(nodeView);
	const style: CSSProperties = {
		color,
		backgroundColor: bgColor || void 0
	};
	const body = (
		<div ref={$dom} style={style} className="emphasis-block relative">
			<div className="border abs-full" style={{ borderColor }}></div>
			<div className="emphasis-block-icon" contentEditable={false}>
				<IconPicker
					onChange={(v) => nodeView.setNodeAttribute('icon', v)}
					style={{
						width: 24,
						height: 24,
						justifyContent: 'center',
						lineHeight: 1,
						fontSize: 16,
						padding: '3px'
					}}
				>
					{icon.type === 'icon' ? (
						<Icon name={icon.value as any} color={icon.color} />
					) : (
						icon.value
					)}
				</IconPicker>
			</div>
			<div ref={$contentDOM} className="emphasis-block-content" />
			<ToggleButton
				IconComponent={() => null}
				subPanel={({ close }) => (
					<MenuList>
						<Menu
							placement="right-start"
							content={
								<ColorMark
									color={color}
									bgColor={bgColor}
									footer={<></>}
									onChange={({ color, bgColor, borderColor }) => {
										nodeView.setNodeAttributes({ color, bgColor, borderColor });
										close();
									}}
								/>
							}
						>
							<MenuItem>
								<SvgPalette className="mr-1" />
								<ListItemText>颜色</ListItemText>
							</MenuItem>
						</Menu>
					</MenuList>
				)}
				className="emphasis-block-more"
			>
				<SvgMore />
			</ToggleButton>
		</div>
	);
	return <Tools extraMenu={ColorPalette}>{body}</Tools>;
};
