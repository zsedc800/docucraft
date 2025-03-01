import { NodeSelection } from 'prosemirror-state';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ListItemButton, {
	listItemButtonClasses
} from '@mui/material/ListItemButton';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import { useContext, useEffect, useRef } from '@docucraft/srender';
import { schema } from '../../model';
import { IconBlock } from '../IconBlock';
import { nodeViewContext } from '../../utils/view';
import { overrides } from '../../utils';
import { BlockItem } from './interface';
import { basicTools, blocklist } from './menuItemConfig';
import { keyboardNavigator } from '../../utils/keyboardNav';

export default ({
	close,
	text = ''
}: {
	close?: () => void;
	text?: string;
}) => {
	const { nodeView } = useContext(nodeViewContext);
	const keyword = text.replace(/\//, '');
	const $panel = useRef<HTMLDivElement>(null);

	useEffect(() => {
		return keyboardNavigator($panel.current, { selectableRole: 'button' });
	}, []);

	const renderBlockItem = ({
		cover: Cover,
		title,
		description,
		handler,
		type = 'block'
	}: BlockItem) => (
		<ListItem
			tabIndex={0}
			onClick={() => {
				const { view } = nodeView;
				const { state, dispatch } = view;
				const {
					selection: { $from },
					tr,
					doc
				} = state;
				const start = $from.before();
				let transaction = tr;
				if (type === 'block') {
					transaction = tr.setSelection(NodeSelection.create(doc, start));
				}

				const node = $from.parent;
				if (node.type === schema.nodes.paragraph)
					transaction = transaction.delete(
						start + 1,
						start + node.nodeSize - 1
					);

				handler(overrides(state, { tr: transaction }) as any, dispatch, view);
				if (type === 'block') view.focus();
				close && close();
			}}
		>
			<ListItemButton>
				<ListItemAvatar>
					<Avatar className="avatar" variant="rounded">
						<Cover />
					</Avatar>
				</ListItemAvatar>
				<ListItemText primary={title} secondary={description} />
			</ListItemButton>
		</ListItem>
	);

	const baselist = (
		<>
			<Box
				className="group"
				sx={(t) => ({
					borderBottom: `1px solid ${t.palette.grey[100]}`
				})}
			>
				<Typography className="subTitle">最近使用</Typography>
				<Stack direction="row" spacing={1} className="content history">
					<Chip size="small" label="代码块"></Chip>
					<Chip size="small" label="任务列表"></Chip>
					<Chip size="small" label="表格"></Chip>
				</Stack>
			</Box>
			<Box className="group">
				<Typography className="subTitle">常见块</Typography>
				<Box
					className="content basic-list"
					sx={(t) => ({
						display: 'grid',
						gridTemplateColumns: 'repeat(6, 1fr)',
						gap: '4px',
						'& .iconButton': {
							fontSize: '22px'
						}
					})}
				>
					{basicTools.map((props) => (
						<IconBlock {...{ ...(props as any) }} type="block" />
					))}
				</Box>
			</Box>
			<Box className="group">
				<Typography style={{ paddingBottom: 0 }} className="subTitle">
					基础块
				</Typography>
				<List dense className="content block-list">
					{blocklist.map(renderBlockItem)}
				</List>
			</Box>
		</>
	);

	const res = ([] as BlockItem[])
		.concat(basicTools, blocklist)
		.filter((item) => item.name.includes(keyword));

	const searchlist = (
		<Box className="group">
			<Typography className="subTitle">搜索结果</Typography>
			<List dense className="content search-list">
				{res.length > 0
					? res.map((item) =>
							renderBlockItem({ ...item, cover: item.cover || item.icon })
						)
					: 'no'}
			</List>
		</Box>
	);

	return (
		<Paper
			className="scrollbar"
			tabIndex={0}
			ref={$panel}
			sx={(t) => ({
				width: 300,
				maxHeight: '480px',
				boxSizing: 'border-box',
				'& .subTitle': {
					fontSize: '12px',
					padding: '8px 16px',
					color: t.palette.text.secondary
				},
				'& .group': {
					'.basic-list, .history': {
						padding: '8px 16px'
					}
				}
			})}
		>
			{keyword ? searchlist : baselist}
		</Paper>
	);
};
