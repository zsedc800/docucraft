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
import SvgImage from '@docucraft/icons/svg/ImagesmodeFill';
import SvgMood from '@docucraft/icons/svg/Mood';
import SvgTable from '../../assets/svg/SvgTable';
import SvgBlockQuote from '../../assets/svg/BlockQuote';
import SvgDivider from '../../assets/svg/Divider';
import SvgEmphsis from '../../assets/svg/Emphsis';
import { BlockItem, ToolItem } from './interface';
import { transformToNode } from '../../commands';
import { schema } from '../../model';
import { nextTick } from '../../utils';
import { basePop, prompt } from '../../components/popover';
import { createTable } from '../../components/tables/commands';
import { insertTimeline } from '../../components/timeline';
import {
	EmojiPicker,
	EmojiPickerPop,
	IconPicker,
	IconPickerPop
} from '../Picker';
import { TextSelection } from 'prosemirror-state';
export const basicTools: ToolItem[] = [
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

export const blocklist: BlockItem[] = [
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
	},
	{
		title: '时间轴',
		description: '时间线',
		name: 'timeline',
		cover: SvgEmphsis,
		handler: insertTimeline()
	},
	{
		title: '图片',
		description: 'image',
		name: 'image',
		cover: SvgImage,
		handler: transformToNode(schema.nodes.image)
	},
	{
		title: '图片列表',
		description: '图片库，图片画廊',
		name: 'imageGallery',
		cover: SvgImage,
		handler: transformToNode(schema.nodes.imageGallery)
	},
	{
		title: 'emoji表情',
		description: 'emoji',
		name: 'emoji',
		cover: SvgMood,
		handler: ({ tr }, dispatch, view) => {
			if (!view) return false;
			dispatch?.(
				tr.setSelection(TextSelection.create(tr.doc, tr.selection.from + 1))
			);
			EmojiPickerPop(view);
			return false;
		}
	},
	{
		title: '图标',
		description: '图标',
		name: 'icon',
		cover: SvgMood,
		handler: ({ tr }, dispatch, view) => {
			if (!view) return false;
			dispatch?.(
				tr.setSelection(TextSelection.create(tr.doc, tr.selection.from + 1))
			);
			IconPickerPop(view);
			return false;
		}
	}
];
