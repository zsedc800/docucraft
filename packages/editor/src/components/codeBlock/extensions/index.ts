import {
	lineNumbers,
	highlightActiveLineGutter,
	highlightSpecialChars,
	drawSelection,
	dropCursor,
	rectangularSelection,
	crosshairCursor,
	highlightActiveLine,
	keymap,
	EditorView
} from '@codemirror/view';
import { Compartment, EditorState, Extension } from '@codemirror/state';
import {
	foldGutter,
	indentOnInput,
	syntaxHighlighting,
	defaultHighlightStyle,
	bracketMatching,
	foldKeymap
} from '@codemirror/language';
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import {
	closeBrackets,
	autocompletion,
	closeBracketsKeymap,
	completionKeymap
} from '@codemirror/autocomplete';
import { lintKeymap } from '@codemirror/lint';
import { baseTheme } from '../themes/base';
import { oneDark } from '../themes/theme-one-dark';
import loadLanguage, {
	detectLanguageFromCode,
	languageCompartment
} from './loadLanguage';
import { isEditorEmpty, isFullSelection } from '../utils';
export const tabSize = new Compartment();

export const lineNumberCompartment = new Compartment();
const basicSetup: Extension = [
	highlightActiveLineGutter(),
	highlightSpecialChars(),
	history(),
	foldGutter(),
	drawSelection(),
	dropCursor(),
	EditorState.allowMultipleSelections.of(true),
	indentOnInput(),
	syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
	bracketMatching(),
	closeBrackets(),
	autocompletion(),
	rectangularSelection(),
	crosshairCursor(),
	// highlightActiveLine(),
	highlightSelectionMatches(),
	keymap.of([
		...closeBracketsKeymap,
		...defaultKeymap,
		...searchKeymap,
		...historyKeymap,
		...foldKeymap,
		...completionKeymap,
		...lintKeymap
	])
];

const extensions: Extension[] = [
	basicSetup,
	languageCompartment.of([]),
	tabSize.of(EditorState.tabSize.of(2)),
	baseTheme,
	oneDark
];

export function toggleLineNumber(view: EditorView, show: boolean) {
	view.dispatch({
		effects: lineNumberCompartment.reconfigure(show ? lineNumbers() : [])
	});
}

export default extensions;
