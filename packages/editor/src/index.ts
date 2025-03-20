import { Plugin } from 'prosemirror-state';
import EditorView from './EditorView';
import { createAutoSavePlugin } from './plugins/autoSave';
import { EventEmitter } from './utils/Event';
import { setupEditor } from './view';

export default class Editor extends EventEmitter {
	view: EditorView;
	constructor(el: HTMLElement) {
		super();
		this.setup(el);
	}

	setup(el: HTMLElement) {
		const view = setupEditor(el);
		this.view = view;
		this.addPlugin([
			createAutoSavePlugin((content) => this.emit('change', content, this.view))
		]);
	}

	addPlugin(plugins: Plugin[]) {
		const { view } = this;
		const newState = view.state.reconfigure({
			plugins: [...view.state.plugins, ...plugins]
		});
		view.updateState(newState);
	}

	onChange(fn: (content: string, view: EditorView) => void) {
		this.on('change', fn);
	}

	parseJSON(json: string | Record<string, any>) {
		if (typeof json === 'string') json = JSON.parse(json);
		const { view } = this;
		const {
			state: { tr, schema, doc },
			dispatch
		} = view;
		dispatch(tr.replaceWith(0, doc.content.size, schema.nodeFromJSON(json)));
	}

	destroy = () => {
		this.view.destroy();
	};
}
export * from './kits/Input';
