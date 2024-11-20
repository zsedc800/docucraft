import { Plugin } from 'prosemirror-state';
import { closeFloatBar, showFloatBar } from './FloatBar';

export default () => {
	let updated = false;
	return new Plugin({
		props: {
			handleDOMEvents: {
				mousedown: () => {
					updated = false;
				},
				mouseup: (view) => {
					const {
						state: { selection }
					} = view;

					if (!selection.empty && updated && view.hasFocus())
						showFloatBar(view);
				}
			}
		},
		view() {
			return {
				update(view, { selection: { from, to } }) {
					const { state } = view;
					const { selection } = state;
					if (selection.from !== from || selection.to !== to) {
						closeFloatBar();
						updated = true;
					}
				},
				destroy() {}
			};
		}
	});
};
