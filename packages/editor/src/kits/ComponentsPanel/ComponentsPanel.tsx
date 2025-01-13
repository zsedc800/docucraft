import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import { schema } from '../../model';
import { NodeSelection } from 'prosemirror-state';
import { basicTools, blocklist } from './menuItemConfig';
import Typography from '@mui/material/Typography';
import { IconBlock } from '../IconBlock';
import ListItemButton, {
	listItemButtonClasses
} from '@mui/material/ListItemButton';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import { useContext } from '@docucraft/srender';
import { nodeViewContext } from '../../utils/view';
import { overrides } from '../../utils';

export default () => {
	const { nodeView } = useContext(nodeViewContext);
	return (
		<Paper
			className="scrollbar"
			sx={(t) => ({
				padding: '0 15px',
				width: 300,
				boxSizing: 'border-box',
				'& .subTitle': {
					fontSize: '12px',
					paddingBottom: '4px',
					color: t.palette.text.secondary
				},
				'& .group': {
					padding: '8px 0'
				}
			})}
		>
			<Box
				className="group"
				sx={(t) => ({
					borderBottom: `1px solid ${t.palette.grey[100]}`
				})}
			>
				<Typography className="subTitle">最近使用</Typography>
				<Stack direction="row" spacing={1}>
					<Chip size="small" label="代码块"></Chip>
					<Chip size="small" label="任务列表"></Chip>
					<Chip size="small" label="表格"></Chip>
				</Stack>
			</Box>
			<Box className="group">
				<Typography className="subTitle">常见块</Typography>
				<Box
					sx={(t) => ({
						display: 'grid',
						gridTemplateColumns: 'repeat(6, 1fr)',
						'& .iconButton': {
							fontSize: '22px',
							padding: '4px'
						}
					})}
				>
					{basicTools.map((props) => (
						<IconBlock type="block" {...{ ...props }} />
					))}
				</Box>
			</Box>
			<Box className="group">
				<Typography className="subTitle">基础块</Typography>
				<List
					sx={(t) => ({
						[`& .${listItemButtonClasses.root}`]: {
							padding: '4px',
							marginLeft: '-4px',
							borderRadius: '4px'
						},
						'& .avatar': {
							backgroundColor: 'transparent',
							border: `1px solid #e3e4e5`,
							svg: {
								width: '100%',
								height: '100%',
								color: '#e3e4e5'
							}
						}
					})}
				>
					{blocklist.map(({ cover: Cover, title, description, handler }) => (
						<ListItem
							onClick={() => {
								const { view } = nodeView;
								const { state, dispatch } = view;
								const {
									selection: { $from },
									tr,
									doc
								} = state;
								const start = $from.before();
								console.log(start, 'start');

								let transction = tr.setSelection(
									NodeSelection.create(doc, start)
								);
								const node = $from.parent;
								if (node.type === schema.nodes.paragraph)
									transction = transction.delete(
										start + 1,
										start + node.nodeSize
									);
								console.log(node, $from, 111);

								handler(overrides(state, { tr: transction }), dispatch, view);
								// handler(view.state, view.dispatch, view);
								view.focus();
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
					))}
				</List>
			</Box>
		</Paper>
	);
};
