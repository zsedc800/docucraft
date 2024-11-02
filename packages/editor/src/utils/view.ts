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
	ExtendedComponent,
	forwardRef,
	createContext
} from '@docucraft/srender';
import { shallowEqual } from '.';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import Tools from '../components/toolBar/Tools';

export function useNodeView<
	T extends HTMLElement = HTMLElement,
	P extends HTMLElement = HTMLElement
>(nodeView: BaseNodeView) {
	const $dom = useRef<T>();
	const $contentDOM = useRef<P>();
	useLayoutEffect(() => {
		if ($dom.current) nodeView.dom = $dom.current;
		nodeView.contentDOM = $contentDOM.current;
	}, []);

	return {
		$dom,
		$contentDOM
	};
}

export const nodeViewContext = createContext<{ nodeView: BaseNodeView }>(
	{} as any
);

export class BaseNodeView implements NodeView {
	dom: HTMLElement;
	contentDOM?: HTMLElement;
	container?: HTMLElement;
	rootRender: RootRender;
	component: ComponentType<any> = () => '';
	constructor(
		public node: Node,
		public view: EditorView,
		public getPos: () => number | undefined
	) {
		this.dom = createElement('div');
		this.rootRender = createRoot();
	}

	render(p?: any) {
		const props = { nodeView: this, ...this.node.attrs, ...p };
		let element = h(this.component, props);
		element = h(
			nodeViewContext.Provider,
			{ value: { nodeView: this } },
			element
		);
		this.rootRender.render(element);
	}

	ignoreMutation(mutation: MutationRecord) {
		if (this.contentDOM) {
			if (mutation.target !== this.contentDOM) return true;
		}
		return false;
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
		console.log('to destroy====');
		console.log(this.dom.parentNode, 'dom');

		this.dom.remove();
		this.rootRender.unmount();
	}
}
