import { EditorView } from 'codemirror';

export function isEditorEmpty(editor: EditorView) {
	return editor.state.doc.length === 0;
}

export function isFullSelection(editor: EditorView) {
	const docLength = editor.state.doc.length;
	const selection = editor.state.selection.main;

	return selection.from === 0 && selection.to === docLength;
}
