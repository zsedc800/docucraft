import { EditorState } from 'prosemirror-state';
import './hack';
import { schema } from './model';
import { keymap } from 'prosemirror-keymap';
import { history } from 'prosemirror-history';
import { buildInputRules } from './commands/inputRules';
import { getMyKeyMap } from './commands/keymap';
import { onDispatch } from './utils/hooks';
import { CodeBlockViewConstructor } from './components/codeBlock/codeBlockView';
import buildToolbar from './components/toolBar';
import { TaskItemViewConstructor } from './components/taskList';
import { tableEditing } from './components/tables';
import { HeadingViewConstructor } from './components/heading';
import { outlineTreePlugin } from './components/outline';
import { ParagraphViewConstructor } from './components/paragraph';
import { BlockTileViewConstructor } from './components/blockTile';
import { ListItemViewConstructor } from './components/listItem';
import { LinkViewConstructor } from './components/link';
import { DividerViewConstructor } from './components/divider';
import { handleImagePaste, ImageNodeViewConstructor } from './components/image';
import { createTimelineViews } from './components/timeline';
import { ImageGalleryViewConstructor } from './components/imageGallery';
import { VideoNodeViewConstructor } from './components/video';
import { AudioNodeViewConstructor } from './components/audio';
import { createMathNodeView } from './components/math';
import { BlockQuoteViewConstructor } from './components/blockQuote';
import { EmphasisViewConstructor } from './components/emphasis';
import EditorView from './EditorView';
import './themes/default.scss';

export class Editor {
	constructor(container?: HTMLElement) {
		if (container) this.setup(container);
	}

	setup(container: HTMLElement) {
		setupEditor(container);
	}
}

export const setupEditor = (el: HTMLElement | null) => {
	if (!el) return;
	// const toolbar = buildToolbar();

	// 根据 schema 定义，创建 editorState 数据实例
	const editorState = EditorState.create({
		schema,
		plugins: [
			buildInputRules(),
			keymap(getMyKeyMap()),
			history(),
			tableEditing({}),
			outlineTreePlugin,
			buildToolbar(),
			handleImagePaste()
		]
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
			...createMathNodeView(),
			...createTimelineViews()
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
