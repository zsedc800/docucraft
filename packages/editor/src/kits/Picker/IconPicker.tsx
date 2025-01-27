import { EditorView } from 'prosemirror-view';
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import { useState } from '@docucraft/srender';
import Icon, { IconName, iconNameMap } from '@docucraft/icons';
import SearchBox from '../SearchBox';
import { basePop } from '../../components/popover';
import { BaseColorMark } from '../ColorMark';
import useRecents from '../hooks/useRecents';

const iconSet = Object.keys(iconNameMap).map((key) => ({
	name: key as IconName,
	code: iconNameMap[key as IconName]
}));

interface IconItem {
	name: IconName;
	code: number;
}

interface IconList {
	title: string;
	list: IconItem[];
}

function IconPicker() {
	const { entries, put } = useRecents<number, IconItem>(
		'icon-picker-recent',
		15
	);
	const [query, setQuery] = useState('');
	const materialIcons = iconSet.filter(({ name }) => name.includes(query));

	const recent = {
		title: '最近选择',
		list: entries().map(([key, icon]) => icon)
	};

	const [tooltip, setTooltip] = useState<{
		anchor: HTMLElement;
		title: string;
	} | null>(null);

	const [panel, setPanel] = useState<{
		anchor: HTMLElement;
		icon: IconItem;
	} | null>(null);

	const onColorSelect = (color: string) => {};

	return (
		<SearchBox onChange={setQuery} className="icon-picker">
			<List
				className="scrollbar"
				sx={{
					width: '100%',
					bgcolor: 'background.paper',
					position: 'relative',
					overflow: 'auto',
					maxHeight: 380,
					'& ul': { padding: 0 },
					'& .icon-list': {
						display: 'grid',
						gridTemplateColumns: 'repeat(10, 1fr)'
					},
					'& .icon-item': {
						display: 'inline-flex',
						width: 36,
						height: 36,
						justifyContent: 'center',
						alignItems: 'center',
						fontSize: 28,
						borderRadius: '5px',
						cursor: 'pointer',
						'&:hover': {
							backgroundColor: '#f3f4f5'
						}
					}
				}}
				subheader={<li />}
			>
				{[recent, { title: 'Material图标集', list: materialIcons }].map(
					({ title, list }) => (
						<li key={title}>
							<ul>
								<ListSubheader style={{ padding: 0, fontWeight: 600 }}>
									{title}
								</ListSubheader>
								<li className="icon-list">
									{list.map((item) => {
										const { name } = item;
										return (
											<span
												className="icon-item"
												data-icon-mark
												onMouseEnter={(e) => {
													setTooltip({
														anchor: e.target as HTMLElement,
														title: name.split('_').join(' ')
													});
												}}
												onMouseLeave={() => setTooltip(null)}
												onClick={(e) =>
													setPanel({
														anchor: e.currentTarget as HTMLElement,
														icon: item
													})
												}
											>
												<Icon data-icon-mark name={name} />
											</span>
										);
									})}
								</li>
							</ul>
						</li>
					)
				)}
			</List>
			<Popper open={!!tooltip} anchorEl={tooltip?.anchor} placement="top">
				<span
					className="tips"
					style={{
						borderRadius: 5,
						color: '#fff',
						backgroundColor: 'rgba(0,0,0,0.8)',
						padding: '4px 8px',
						fontSize: 15
					}}
				>
					{tooltip?.title}
				</span>
			</Popper>
			<Popper open={!!panel} anchorEl={panel?.anchor} placement="bottom">
				<ClickAwayListener
					onClickAway={(e) => {
						const mark = (e.target as HTMLElement)?.getAttribute(
							'data-icon-mark'
						);
						if (mark) return;
						setPanel(null);
					}}
				>
					<Paper>
						<BaseColorMark title="图标颜色" onChange={onColorSelect}>
							<Divider style={{ margin: '4px 0' }} />
							<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
								<Button
									variant="contained"
									size="small"
									color="secondary"
									onClick={() => onColorSelect('inherit')}
								>
									默认颜色
								</Button>
							</div>
						</BaseColorMark>
					</Paper>
				</ClickAwayListener>
			</Popper>
		</SearchBox>
	);
}

export function IconPickerPop(view: EditorView) {
	basePop({
		view,
		render(props) {
			return <IconPicker />;
		}
	});
}

export default IconPicker;
