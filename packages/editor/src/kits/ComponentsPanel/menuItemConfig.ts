import { TextSelection } from 'prosemirror-state';
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
import SvgImagelist from '@docucraft/icons/svg/PhotoLibrary';
import SvgVideo from '@docucraft/icons/svg/MovieFill';
import SvgAudio from '@docucraft/icons/svg/MicFill';
import SvgMood from '@docucraft/icons/svg/Mood';
import SvgIcon from '@docucraft/icons/svg/EmojiObjects';
import SvgMath from '@docucraft/icons/svg/Functions';
import SvgTimeline from '@docucraft/icons/svg/Timeline';
import SvgMind from '@docucraft/icons/svg/Flowsheet';

import SvgTable from '../../assets/svg/SvgTable';
import SvgBlockQuote from '../../assets/svg/BlockQuote';
import SvgDivider from '../../assets/svg/Divider';
import SvgEmphsis from '../../assets/svg/Emphsis';
import { BlockItem } from './interface';
import { createNode, transformToNode } from '../../commands';
import { schema } from '../../model';
import { nextTick } from '../../utils';
import { prompt } from '../../components/popover';
import { createTable } from '../../components/tables/commands';
import { insertTimeline } from '../../components/timeline/commands';
import { EmojiPickerPop, IconPickerPop } from '../Picker';

export const inlineBlocks: BlockItem[] = [
	{
		// blockType: 'link',
		title: '添加链接',
		name: 'link',
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
						transformToNode(() =>
							createNode(
								schema.nodes.link,
								{ href: res.url },
								schema.text(res.text || '链接')
							)
						)
					)
					.then((fn) => fn(view.state, view.dispatch, view))
					.then(() => view.focus());
			});
			return false;
		}
	},
	{
		blockType: 'emoji',
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
		blockType: 'icon',
		title: '图标',
		description: '图标',
		name: 'icon',
		cover: SvgIcon,
		handler: ({ tr }, dispatch, view) => {
			if (!view) return false;
			dispatch?.(
				tr.setSelection(TextSelection.create(tr.doc, tr.selection.from + 1))
			);
			IconPickerPop(view);
			return false;
		}
	},
	{
		blockType: 'mathInline',
		title: '行内公式',
		description: '行内公式',
		name: 'mathInline',
		cover: SvgMath,
		type: 'inline',
		handler: (state, dispatch, view) => {
			const {
				tr,
				selection: { from }
			} = state;
			const pos = tr.mapping.map(from);

			if (dispatch)
				dispatch(tr.insert(pos, createNode(schema.nodes.mathInline)));
			return true;
		}
	}
];

export const basicBlocks: BlockItem[] = [
	{
		blockType: 'paragraph',
		title: '文本',
		name: 'text',
		icon: SvgTitle,
		handler: (state, dispatch) => {
			dispatch?.(state.tr);
			return false;
		}
	},
	{
		blockType: 'heading',
		title: '一级标题',
		name: 'h1',
		icon: SvgH1,
		handler: transformToNode(schema.nodes.heading, { level: 1 })
	},
	{
		blockType: 'heading',
		title: '二级标题',
		name: 'h2',
		icon: SvgH2,
		handler: transformToNode(schema.nodes.heading, { level: 2 })
	},
	{
		blockType: 'heading',
		title: '三级标题',
		name: 'h3',
		icon: SvgH3,
		handler: transformToNode(schema.nodes.heading, { level: 3 })
	},
	{
		blockType: 'heading',
		title: '四级标题',
		name: 'h4',
		icon: SvgH4,
		handler: transformToNode(schema.nodes.heading, { level: 4 })
	},
	{
		blockType: 'heading',
		title: '五级标题',
		name: 'h5',
		icon: SvgH5,
		handler: transformToNode(schema.nodes.heading, { level: 5 })
	},
	{
		blockType: 'heading',
		title: '六级标题',
		name: 'h6',
		icon: SvgH6,
		handler: transformToNode(schema.nodes.heading, { level: 6 })
	},
	{
		blockType: 'codeBlock',
		title: '代码块',
		name: 'codeBlock',
		icon: SvgCodeBlock,
		handler: transformToNode(schema.nodes.codeBlock)
	},
	{
		blockType: 'ordered_list',
		title: '有序列表',
		name: 'ordered_list',
		icon: SvgOrderList,
		handler: transformToNode(schema.nodes.ordered_list)
	},
	{
		blockType: 'bullet_list',
		title: '无序列表',
		name: 'bullet_list',
		icon: SvgBulletList,
		handler: transformToNode(schema.nodes.bullet_list)
	},
	{
		blockType: 'taskList',
		title: '任务列表',
		name: 'taskList',
		icon: SvgAddTask,
		handler: transformToNode(schema.nodes.taskList)
	}
];
const [link, ...others] = inlineBlocks;
export const basicTools: BlockItem[] = [...basicBlocks, link];

export const blocks: BlockItem[] = [
	{
		blockType: 'table',
		title: '表格',
		description: '添加表格',
		cover: SvgTable,
		name: 'table',
		handler: createTable(3, 3)
	},
	{
		blockType: 'blockQuote',
		title: '引用',
		description: '摘要引用',
		cover: SvgBlockQuote,
		name: 'blockQuote',
		handler: transformToNode(schema.nodes.blockQuote)
	},

	{
		blockType: 'divider',
		title: '分隔线',
		description: '创建元素分割线',
		cover: SvgDivider,
		name: 'divider',
		handler: transformToNode(schema.nodes.divider)
	},
	{
		blockType: 'emphasis',
		title: '标注',
		description: '强调块',
		cover: SvgEmphsis,
		name: 'emphasis',
		handler: transformToNode(schema.nodes.emphasis)
	},
	{
		blockType: 'timeline',
		title: '时间轴',
		description: '时间线',
		name: 'timeline',
		cover: SvgTimeline,
		handler: insertTimeline()
	},
	{
		blockType: 'image',
		title: '图片',
		description: 'image',
		name: 'image',
		cover: SvgImage,
		handler: transformToNode(schema.nodes.image)
	},
	{
		blockType: 'imageGallery',
		title: '图片列表',
		description: '图片库，图片画廊',
		name: 'imageGallery',
		cover: SvgImagelist,
		handler: transformToNode(schema.nodes.imageGallery)
	},
	{
		blockType: 'video',
		title: '视频',
		description: '视频链接或文件',
		name: 'video',
		cover: SvgVideo,
		handler: transformToNode(schema.nodes.video)
	},
	{
		blockType: 'audio',
		title: '音频',
		description: '音频链接或文件',
		name: 'audio',
		cover: SvgAudio,
		handler: transformToNode(schema.nodes.audio)
	},

	{
		blockType: 'mathBlock',
		title: '公式块',
		description: '块状公式',
		name: 'mathBlock',
		cover: SvgMath,
		handler: transformToNode(schema.nodes.mathBlock)
	},
	{
		title: '思维导图',
		description: 'mindMap 思维导图',
		cover: SvgMind,
		handler: transformToNode(schema.nodes.xmind),
		name: 'xmind'
	}
];

export const blocklist: BlockItem[] = [...blocks, ...others];
