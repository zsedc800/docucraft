import { EditorView } from 'prosemirror-view';

let view: { current?: EditorView } = {};
export const addView = (v: EditorView) => (view.current = v);
export const getView = () => view.current;
export default () => '';
