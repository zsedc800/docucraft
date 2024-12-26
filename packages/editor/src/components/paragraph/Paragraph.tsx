import Typography from '@mui/material/Typography';
import { BaseNodeView, BaseNodeViewProps, useNodeView } from '../../utils/view';
import { ParagraphView } from '.';
import Tools from '../toolBar/Tools';
import Popper from '@mui/material/Popper';
import { useContext, useEffect, useState } from '@docucraft/srender';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import SvgTitle from '@docucraft/icons/svg/TitleFill';
import SvgH1 from '@docucraft/icons/svg/FormatH1';
import SvgH2 from '@docucraft/icons/svg/FormatH2';
import SvgH3 from '@docucraft/icons/svg/FormatH3';
import SvgH4 from '@docucraft/icons/svg/FormatH4';
import SvgH5 from '@docucraft/icons/svg/FormatH5';
import SvgH6 from '@docucraft/icons/svg/FormatH6';
import SvgOrderList from '@docucraft/icons/svg/FormatListNumberedFill';
import SvgBulletList from '@docucraft/icons/svg/FormatListBulletedFill';
import SvgAddTask from '@docucraft/icons/svg/AddTaskFill';
import SvgLink from '@docucraft/icons/svg/LinkFill';
import SvgCodeBlock from '@docucraft/icons/svg/CodeBlocks';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItem, { listItemButtonClasses } from '@mui/material/ListItemButton';
import List from '@mui/material/List';
import Avatar from '@mui/material/Avatar';
import SvgTable from '../../assets/svg/SvgTable';
import SvgBlockQuote from '../../assets/svg/BlockQuote';
import SvgDivider from '../../assets/svg/Divider';
import SvgEmphsis from '../../assets/svg/Emphsis';
import { transformToNode } from '../../commands';
import { schema } from '../../model';
import { classnames, nextTick, overrides } from '../../utils';
import { prompt, usePopover } from '../popover';
import { IconBlock } from '../../kits';
import { ToolItem } from '../toolBar/index.old';
import Paper from '@mui/material/Paper';
import { ReactNode } from 'react';
import { Command, NodeSelection } from 'prosemirror-state';
import { createTable } from '../tables/commands';

interface Props extends BaseNodeViewProps {
	nodeView: ParagraphView;
	placeholder: string;
	text?: string;
}

const basicTools: ToolItem[] = [
	{
		title: '文本',
		icon: SvgTitle,
		handler: (state, dispatch) => {
			dispatch?.(state.tr);
			return false;
		}
	},
	{
		title: '一级标题',
		icon: SvgH1,
		handler: transformToNode(schema.nodes.heading, { level: 1 })
	},
	{
		title: '二级标题',
		icon: SvgH2,
		handler: transformToNode(schema.nodes.heading, { level: 2 })
	},
	{
		title: '三级标题',
		icon: SvgH3,
		handler: transformToNode(schema.nodes.heading, { level: 3 })
	},
	{
		title: '四级标题',
		icon: SvgH4,
		handler: transformToNode(schema.nodes.heading, { level: 4 })
	},
	{
		title: '五级标题',
		icon: SvgH5,
		handler: transformToNode(schema.nodes.heading, { level: 5 })
	},
	{
		title: '六级标题',
		icon: SvgH6,
		handler: transformToNode(schema.nodes.heading, { level: 6 })
	},
	{
		title: '代码块',
		icon: SvgCodeBlock,
		handler: transformToNode(schema.nodes.codeBlock)
	},
	{
		title: '有序列表',
		icon: SvgOrderList,
		handler: transformToNode(schema.nodes.ordered_list)
	},
	{
		title: '无序列表',
		icon: SvgBulletList,
		handler: transformToNode(schema.nodes.bullet_list)
	},
	{
		title: '任务列表',
		icon: SvgAddTask,
		handler: transformToNode(schema.nodes.taskList)
	},
	{
		title: '添加链接',
		icon: SvgLink,
		handler: (state, dispatch, view) => {
			if (!view) return false;
			view.dispatch(state.tr);
			nextTick(() => {
				prompt(
					{
						title: '添加链接',
						fields: [
							{ name: 'url', label: '链接地址', required: true },
							{ name: 'text', label: '文本' }
						]
					},
					view!
				)
					.then((res: any) =>
						transformToNode(
							schema.nodes.link,
							{ href: res.url },
							schema.text(res.text || '链接')
						)
					)
					.then((fn) => fn(view.state, view.dispatch, view))
					.then(() => view.focus());
			});
			return false;
		}
	}
];

interface BlockItem {
	title: string;
	name: string;
	cover: string | ((props: any) => ReactNode);
	description: string;
	handler: Command;
}
const blocklist: BlockItem[] = [
	{
		title: '表格',
		description: '添加表格',
		cover: SvgTable,
		name: 'table',
		handler: createTable(3, 3)
	},
	{
		title: '引用',
		description: '摘要引用',
		cover: SvgBlockQuote,
		name: 'blockquote',
		handler: transformToNode(schema.nodes.blockQuote)
	},
	{
		title: '分隔线',
		description: '创建元素分割线',
		cover: SvgDivider,
		name: 'divider',
		handler: transformToNode(schema.nodes.divider)
	},
	{
		title: '标注',
		description: '强调块',
		cover: SvgEmphsis,
		name: 'emphsis',
		handler: transformToNode(schema.nodes.divider)
	}
];

export default ({ nodeView, placeholder, hidden, text = '' }: Props) => {
	const { $dom, $contentDOM } = useNodeView<HTMLDivElement>(nodeView);

	const [{ plain }, childrenHolder] = usePopover(nodeView.view);

	const isToplevel = nodeView.depth === 0;

	const poper = (
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
							border: `1px solid #e3e4e5`
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
							<ListItemAvatar>
								<Avatar className="avatar" variant="rounded">
									<Cover />
								</Avatar>
							</ListItemAvatar>
							<ListItemText primary={title} secondary={description} />
						</ListItem>
					))}
				</List>
			</Box>
		</Paper>
	);
	useEffect(() => {
		if (!isToplevel) return;

		if (/^\//.test(text)) {
			if (!plain.visible) plain(poper);
		} else if (plain.visible) {
			plain.close();
		}
	}, [text]);

	const body = (
		<div
			ref={$dom}
			className={classnames('block text-block', { hidden, empty: !text })}
			data-placeholder={placeholder}
		>
			<Typography className="paragraph" ref={$contentDOM} />
		</div>
	);
	return (
		<>
			{isToplevel ? <Tools>{body}</Tools> : body}
			{childrenHolder}
		</>
	);
};
