import { Plugin } from 'prosemirror-state';
import { closeFloatBar, showFloatBar } from './FloatBar';
import { nextTick } from '../../utils';
export default () => {
	return new Plugin({
		props: {
			handleDOMEvents: {
				mouseup: (view) => {
					nextTick().then(() => {
						const {
							state: { selection }
						} = view;

						if (!selection.empty && view.hasFocus()) showFloatBar(view);
					});
				}
			}
		},
		view() {
			return {
				update(view, { selection: { from, to } }) {
					const { state } = view;
					const { selection } = state;

					if (selection.from !== from || selection.to !== to) closeFloatBar();
				},
				destroy() {}
			};
		}
	});
};
