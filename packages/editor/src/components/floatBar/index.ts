import { EditorView } from 'prosemirror-view';
import FloatBar from './FloatBar';

let instance: ReturnType<typeof FloatBar> | undefined;
export const showFloatBar = (view: EditorView) => {
	if (!instance) instance = FloatBar(view);
	else instance.show();
};

export const closeFloatBar = () => {
	if (instance?.visible) instance.close();
};
