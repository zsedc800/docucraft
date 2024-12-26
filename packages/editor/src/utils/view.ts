import { Node } from 'prosemirror-model';
import {
	Decoration,
	DecorationSource,
	EditorView,
	NodeView
} from 'prosemirror-view';
import createElement from '../createElement';
import {
	ComponentType,
	createElement as h,
	createRoot,
	RootRender,
	useLayoutEffect,
	useRef,
	createContext
} from '@docucraft/srender';
import { shallowEqual } from '.';
import { ThemeProvider, createTheme } from '@mui/material/styles';

export function useNodeView<
	T extends HTMLElement = HTMLDivElement,
	P extends HTMLElement = HTMLDivElement
>(nodeView: BaseNodeView) {
	const $dom = useRef<T>(null);
	const $contentDOM = useRef<P>(null);
	useLayoutEffect(() => {
		if ($dom.current) nodeView.dom = $dom.current;
		if ($contentDOM.current) nodeView.contentDOM = $contentDOM.current;
	}, []);

	return {
		$dom,
		$contentDOM
	};
}

export const nodeViewContext = createContext<{ nodeView: BaseNodeView }>(
	{} as any
);

export interface BaseNodeViewProps {
	nodeView: BaseNodeView;
	hidden: boolean;
}

export class BaseNodeView implements NodeView {
	dom: HTMLElement;
	contentDOM?: HTMLElement;
	container?: HTMLElement;
	rootRender: RootRender;
	blockId: string;
	component: ComponentType<any> = () => '';
	depth: number;
	constructor(
		public node: Node,
		public view: EditorView,
		public getPos: () => number | undefined
	) {
		this.dom = createElement('div');
		this.rootRender = createRoot();
		const pos = getPos();
		this.depth = pos || pos === 0 ? view.state.doc.resolve(pos).depth : -1;
		this.blockId = node.attrs.blockId;
		Promise.resolve().then(() =>
			this.rootRender.updateContainer(this.dom.parentElement!)
		);
	}

	render(p?: any) {
		const props = { nodeView: this, ...this.node.attrs, ...p };
		let element = h(this.component, props);
		element = h(
			nodeViewContext.Provider,
			{ value: { nodeView: this } },
			element
		);
		// element = h(
		// 	ThemeProvider,
		// 	{
		// 		theme: createTheme({
		// 			typography: { fontSize:  }
		// 		})
		// 	},
		// 	element
		// );
		this.rootRender.render(element);
	}

	ignoreMutation(mutation: MutationRecord) {
		return mutation.target !== this.contentDOM;
	}

	update(
		node: Node,
		decorations?: readonly Decoration[],
		innerDecorations?: DecorationSource
	) {
		const { type, attrs } = node;
		const { attrs: props, type: t } = this.node;
		if (type !== t) return false;

		this.node = node;

		if (this.component) {
			if (!shallowEqual(props, attrs)) {
				this.render();
			}
		} else if (node.attrs.hidden !== this.node.attrs.hidden) {
			if (node.attrs.hidden) {
				this.dom.classList.add('hidden');
			} else {
				this.dom.classList.remove('hidden');
			}
		}
		return true;
	}
	destroy() {
		this.rootRender.unmount();
		this.dom.remove();
	}
}
