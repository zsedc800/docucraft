import { Attrs, MarkType, Schema } from 'prosemirror-model';
import { TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { CSSProperties } from 'react';

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
export const unSetMark = (view: EditorView, markType: MarkType | string) => {
	const { selection, tr, schema } = view.state;
	const { $from, $to } = selection;

	view.dispatch(
		tr.removeMark($from.pos, $to.pos, getMarkType(markType, schema))
	);
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
	if (isMarkActive(view, markType)) return unSetMark(view, markType);
	else return setMark(view, markType);
}

export const applyBold = (view: EditorView) => toggleMark(view, 'bold');
export const applyUnderline = (view: EditorView) =>
	toggleMark(view, 'underline');
export const applyLinethrough = (view: EditorView) =>
	toggleMark(view, 'linethrough');
export const applylink = (url: string) => (view: EditorView) =>
	setMark(view, 'link', { href: url });

export const applyStyle =
	(style: CSSProperties) =>
	({ state, dispatch }: EditorView) => {
		const { schema, selection } = state;
		const markType = schema.marks.style;
		let tr = state.tr;
		console.log(selection, 'sel');
		const { from, to } = selection;
		state.doc.nodesBetween(from, to, (node, pos) => {
			if (node.isText) {
				let existingMark = node.marks.find((mark) => mark.type === markType);
				let attrs = existingMark ? { ...existingMark.attrs, ...style } : style;
				tr = tr.addMark(
					pos < from ? from : pos,
					pos + node.nodeSize > to ? to : pos + node.nodeSize,
					markType.create(attrs)
				);
			}
		});
		dispatch(tr);
		return true;
	};

export const applyColor = (color?: string) => applyStyle({ color });

export const applyBgColor = (backgroundColor?: string) =>
	applyStyle({ backgroundColor });
