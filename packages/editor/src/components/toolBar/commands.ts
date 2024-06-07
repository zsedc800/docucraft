import { Attrs, MarkType, Schema } from 'prosemirror-model';
import { TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

export const setMark = (
	view: EditorView,
	markType: MarkType | string,
	attrs: Attrs | null = null
) => {
	const { schema, selection, tr } = view.state;
	const { $from, $to } = selection;

	const mark = schema.mark(markType, attrs);

	view.dispatch(tr.addMark($from.pos, $to.pos, mark));
	return true;
};
export const unSetMark = (view: EditorView, markType: MarkType) => {
	const { selection, tr } = view.state;
	const { $from, $to } = selection;

	view.dispatch(tr.removeMark($from.pos, $to.pos, markType));
};
export const setBold = (view: EditorView) => {
	return setMark(view, view.state.schema.marks.bold);
};

export const addLink = (view: EditorView) => {
	return setMark(view, view.state.schema.marks.link, {
		href: 'https://www.baidu.com'
	});
};

function getMarkType(markType: MarkType | string, schema: Schema) {
	return typeof markType === 'string' ? schema.marks[markType] : markType;
}

function isMarkActive(view: EditorView, markType: MarkType | string): boolean {
	const { schema, selection, tr } = view.state;
	if (!(selection instanceof TextSelection)) return false;

	const { $from, $to } = selection;
	const realMarkType = getMarkType(markType, schema);
	let isActive = true;

	tr.doc.nodesBetween($from.pos, $to.pos, (node) => {
		if (!isActive) return false;
		if (node.isInline) {
			const mark = realMarkType.isInSet(node.marks);
			if (!mark) isActive = false;
		}
	});

	return isActive;
}

function toggleMark(view: EditorView, markType: MarkType | string) {
	if (isMarkActive(view, markType))
		return unSetMark(view, getMarkType(markType, view.state.schema));
}
