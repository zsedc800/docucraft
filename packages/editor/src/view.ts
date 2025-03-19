import { EditorState } from 'prosemirror-state';
import './hack';
import { schema } from './model';
import { onDispatch } from './utils/hooks';
import { CodeBlockViewConstructor } from './components/codeBlock/codeBlockView';
import { TaskItemViewConstructor } from './components/taskList';
import { HeadingViewConstructor } from './components/heading';
import { ParagraphViewConstructor } from './components/paragraph';
import { BlockTileViewConstructor } from './components/blockTile';
import { ListItemViewConstructor } from './components/listItem';
import { LinkViewConstructor } from './components/link';
import { DividerViewConstructor } from './components/divider';
import { ImageNodeViewConstructor } from './components/image';
import { createTimelineViews } from './components/timeline';
import { ImageGalleryViewConstructor } from './components/imageGallery';
import { VideoNodeViewConstructor } from './components/video';
import { AudioNodeViewConstructor } from './components/audio';
import { createMathNodeView } from './components/math';
import { BlockQuoteViewConstructor } from './components/blockQuote';
import { EmphasisViewConstructor } from './components/emphasis';
import { XMindViewConstructor } from './components/xmind';
import EditorView from './EditorView';
import plugins from './plugins';
import './themes/default.scss';
import { createAutoSavePlugin } from './plugins/autoSave';

export const setupEditor = (
	el: HTMLElement | null,
	{ onChange }: { onChange?: (e: string) => void } = {}
) => {
	if (!el) return;
	// const toolbar = buildToolbar();
	plugins.push(createAutoSavePlugin(onChange));
	// 根据 schema 定义，创建 editorState 数据实例
	const editorState = EditorState.create({
		schema,
		plugins
	});

	// 创建编辑器视图实例，并挂在到 el 上
	const editorView = new EditorView(el, {
		state: editorState,
		dispatchTransaction(tr) {
			if (!onDispatch(tr)) return;

			const newState = editorView.state.apply(tr);
			editorView.updateState(newState);
			// toolbar.update(editorView, editorView.state);
		},
		nodeViews: {
			codeBlock: CodeBlockViewConstructor,
			taskItem: TaskItemViewConstructor,
			heading: HeadingViewConstructor,
			paragraph: ParagraphViewConstructor,
			blockTile: BlockTileViewConstructor,
			list_item: ListItemViewConstructor,
			link: LinkViewConstructor,
			divider: DividerViewConstructor,
			image: ImageNodeViewConstructor,
			imageGallery: ImageGalleryViewConstructor,
			video: VideoNodeViewConstructor,
			audio: AudioNodeViewConstructor,
			blockQuote: BlockQuoteViewConstructor,
			emphasis: EmphasisViewConstructor,
			xmind: XMindViewConstructor,
			...createMathNodeView(),
			...createTimelineViews()
		},
		markViews: {
			// link: LinkViewConstructor
		},
		handleClickOn(view, pos, node, nodePos, event, direct) {
			const markType = view.state.schema.marks.link;
			const $pos = view.state.doc.resolve(pos);
			const marks = $pos.marks();
			if (marks.some((mark) => mark.type === markType)) {
				const linkMark = marks.find((mark) => mark.type === markType);
				const { href, target } = linkMark?.attrs || {};
				if (href) {
					if ($pos.end() === pos) return false;
					window.open(href, target);
				}
				return true;
			}
			return false;
		}
	});

	return () => {
		editorView.destroy();
	};
};
