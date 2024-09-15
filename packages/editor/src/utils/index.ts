import { Node } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';

let view: { current?: EditorView } = {};
export const addView = (v: EditorView) => (view.current = v);
export const getView = () => view.current;
export default () => '';

export function escapeLatex(latex: string) {
	const escapeMap: Record<string, string> = {
		'\\': '\\\\',
		'{': '\\{',
		'}': '\\}',
		$: '\\$',
		'&': '\\&',
		'#': '\\#',
		_: '\\_',
		'%': '\\%',
		'^': '\\^',
		'~': '\\~'
	};

	return latex.replace(/[\\{}$&#_%^~]/g, (match) => escapeMap[match]);
}

let uniqueIdCounter = 0;
export function generateUniqueId() {
	uniqueIdCounter++;
	return `unique-${uniqueIdCounter}`;
}

export function assignUniqueId(node: any) {
	if (!node.attrs.id) {
		node.attrs.id = generateUniqueId();
	}
}
