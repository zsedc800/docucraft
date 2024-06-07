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
