import { Plugin } from 'prosemirror-state';

export function createAutoSavePlugin(onChange: (doc: string) => void) {
	return new Plugin({
		view(editorView) {
			return {
				update(view, prevState) {
					if (prevState.doc !== view.state.doc) {
						const content = JSON.stringify(view.state.doc.toJSON());
						onChange(content);
					}
				}
			};
		}
	});
}
