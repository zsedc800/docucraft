import { Node } from 'prosemirror-model';
import {
	Decoration,
	DecorationSource,
	NodeView,
	ViewMutationRecord
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
import { generateUniqueId, shallowEqual } from './base';
import EditorView from '../EditorView';

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

export const nodeViewContainer = new Map<string, BaseNodeView>();

export function getNodeView(blockId: string) {
	return nodeViewContainer.get(blockId);
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
	props: Record<string, any>;
	constructor(
		public node: Node,
		public view: EditorView,
		public getPos: () => number | undefined
	) {
		this.dom = createElement('div');
		this.rootRender = createRoot();
		const pos = getPos();
		this.depth = pos || pos === 0 ? view.state.doc.resolve(pos).depth : -1;
		// @ts-ignore
		if (!node.attrs.blockId) node.attrs.blockId = generateUniqueId();

		this.blockId = node.attrs.blockId;
		nodeViewContainer.set(this.blockId, this);
		this.props = {};
		Promise.resolve().then(() => {
			this.rootRender.updateContainer(this.dom.parentElement!);
			this.dom.dataset.blockId = this.blockId;
		});

		this.setNodeAttribute = this.setNodeAttribute.bind(this);
		this.setNodeAttributes = this.setNodeAttributes.bind(this);
		this.deleteNode = this.deleteNode.bind(this);
		this.getResolvedPos = this.getResolvedPos.bind(this);
	}

	// ------ prosemirror node operate methods start

	setNodeAttribute(key: string, val: any) {
		const pos = this.getPos();
		const { state, dispatch } = this.view;
		if (pos || pos === 0) {
			const tr = state.tr.setNodeAttribute(pos, key, val);
			dispatch(tr);
		}
	}

	setNodeAttributes(attrs: Record<string, any>) {
		const pos = this.getPos();
		const { state, dispatch } = this.view;
		if (pos || pos === 0) {
			const tr = state.tr.setNodeMarkup(pos, null, {
				...this.node.attrs,
				...attrs
			});
			dispatch(tr);
		}
	}

	deleteNode() {
		const pos = this.getPos();
		const { state, dispatch } = this.view;
		if (pos || pos === 0) {
			const tr = state.tr.delete(pos, pos + this.node.nodeSize);
			dispatch(tr);
		}
	}

	getResolvedPos() {
		const pos = this.getPos();
		return pos || pos === 0 ? this.view.state.doc.resolve(pos) : null;
	}

	// ------ prosemirror node operate methods end
	// render
	setProps(props: Record<string, any>) {
		this.props = { ...this.props, ...props };
		this.render();
	}
	render(p?: any) {
		const props = { nodeView: this, ...this.node.attrs, ...this.props, ...p };
		let element = h(this.component, props);
		element = h(
			nodeViewContext.Provider as any,
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

	ignoreMutation(mutation: ViewMutationRecord) {
		return (
			mutation.type !== 'selection' &&
			(mutation.target !== this.contentDOM || mutation.type === 'attributes')
		);
	}

	update(
		node: Node,
		decorations?: readonly Decoration[],
		innerDecorations?: DecorationSource
	) {
		const { type, attrs } = node;
		const { attrs: props, type: t } = this.node;
		if (type !== t || this.blockId !== attrs.blockId) return false;
		// @ts-ignore
		if (!node.attrs.blockId) node.attrs.blockId = this.blockId;
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
		nodeViewContainer.delete(this.blockId);
		this.dom.remove();
	}
	selectNode() {
		console.log('selectNode');
	}
	// 抽象方法
	onFocusIn() {}
	onFocusOut(e: { reason: 'change' | 'blur'; event?: Event }) {}
}
