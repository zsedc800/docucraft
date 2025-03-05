import {
	ComponentType,
	RootRender,
	createContext,
	createRoot,
	createElement as h,
	useLayoutEffect,
	useRef
} from '@docucraft/srender';
import { Mark } from 'prosemirror-model';
import { EditorView, MarkView, ViewMutationRecord } from 'prosemirror-view';

export function useMarkView<T extends HTMLElement, P extends HTMLElement>(
	markView: BaseMarkView
) {
	const $dom = useRef<T>(null);
	const $contentDOM = useRef<P>(null);
	useLayoutEffect(() => {
		if ($dom.current) markView.dom = $dom.current;
		if ($contentDOM.current) markView.contentDOM = $contentDOM.current;
	}, []);

	return {
		$dom,
		$contentDOM
	};
}

export const markViewContext = createContext<{ markView: BaseMarkView }>(
	{} as any
);

export class BaseMarkView implements MarkView {
	dom: HTMLElement;
	contentDOM?: HTMLElement;
	id: string;
	component: ComponentType<any> = () => '';
	rootRender: RootRender;
	constructor(
		public mark: Mark,
		public view: EditorView,
		inline: boolean
	) {
		this.rootRender = createRoot();
	}

	// ignoreMutation?: (mutation: ViewMutationRecord) => boolean;
	destroy() {}
	render(p?: any) {
		const props = { nodeView: this, ...this.mark.attrs, ...p };
		let element = h(this.component, props);
		element = h(
			markViewContext.Provider as any,
			{ value: { markView: this } },
			element
		);

		this.rootRender.render(element);
	}
}
