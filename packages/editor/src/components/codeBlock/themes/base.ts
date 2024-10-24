import { EditorView } from '@codemirror/view';

export const baseTheme = EditorView.baseTheme({
	'&': {
		maxHeight: '700px'
	},
	'.cm-scroller': {
		overflow: 'auto',
		padding: '8px 12px 8px 0',
		'&::-webkit-scrollbar': {
			width: '12px',
			height: '12px',
			cursor: 'move'
			// background-color: #23241f,
		},

		'&::-webkit-scrollbar-track': {
			backgroundColor: 'transparent'
		},

		'&::-webkit-scrollbar-button': {
			display: 'none'
		},

		'&::-webkit-scrollbar-thumb': {
			backgroundColor: 'rgba(0, 0, 0, 0.2)',
			borderRadius: '100px'
		},

		'&::-webkit-scrollbar-thumb:hover': {
			backgroundColor: 'rgba(0, 0, 0, 0.6)'
		}
	}
});

const darkTheme = EditorView.theme(
	{
		'&': {
			color: 'white', // 全局文本颜色
			backgroundColor: '#23241f', // 全局背景颜色
			maxHeight: '700px'
		},
		'.cm-content': {
			caretColor: '#ffffff' // 光标颜色
		},
		'&.cm-focused .cm-cursor': {
			borderLeftColor: '#ffffff' // 聚焦时光标颜色
		},
		'&.cm-focused .cm-selectionBackground, ::selection': {
			backgroundColor: '#23241f' // 选中的背景颜色
		},
		'.cm-gutters': {
			backgroundColor: '#23241f', // 行号和折叠箭头所在的 gutter 区域背景色
			color: '#666', // 行号颜色
			border: 'none' // 去掉边框
		}
	},
	{ dark: true }
);
