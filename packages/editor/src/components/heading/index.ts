import {
	Decoration,
	DecorationSource,
	NodeView,
	NodeViewConstructor
} from 'prosemirror-view';
import createElement from '../../createElement';
import { Node } from 'prosemirror-model';
import { assignUniqueId } from '../../utils';
import './style.scss';
import { OutlineNode, OutlineTree, outlineTreeKey } from '../outline';

class ListSymbol implements NodeView {
	dom: HTMLElement;
	constructor(...args: Parameters<NodeViewConstructor>) {
		const [node, view] = args;
		const { level, type } = node.attrs;
		this.dom = createElement(
			'span',
			{
				class: 'list-symbol',
				'data-level': level,
				'data-type': type
			},
			node.textContent
		);
	}
	contentDOM?: HTMLElement | null | undefined;
	update(
		node: Node,
		decorations: readonly Decoration[],
		innerDecorations: DecorationSource
	) {
		return false;
	}
}

type Level = 1 | 2 | 3 | 4 | 5 | 6;

const headingViewMap = new Map<string, HeadingView>();

export class HeadingView implements NodeView {
	dom: HTMLElement;
	contentDOM?: HTMLElement | null | undefined;
	node: Node;
	id: string;
	listSymbol: HTMLElement;
	outlineTree?: OutlineTree;
	constructor(...args: Parameters<NodeViewConstructor>) {
		const [node, view, getPos] = args;
		this.node = node;
		assignUniqueId(this.node);
		const { level, id } = node.attrs;
		this.id = id;
		this.contentDOM = createElement('div', { class: 'heading-content' });
		this.listSymbol = createElement('span', {
			class: 'list-symbol',
			contenteditable: 'false'
		});
		const btn = createElement('button', {}, '折叠');
		this.dom = createElement(
			`h${level as Level}`,
			{ class: 'heading' },
			createElement('div', { class: 'tools', contenteditable: 'false' }, btn)
		);

		this.dom.appendChild(this.listSymbol);
		this.dom.appendChild(this.contentDOM);
		const outlineTree = outlineTreeKey.getState(view.state);
		const pos = getPos();
		headingViewMap.set(node.attrs.id, this);
		if (outlineTree && typeof pos !== 'undefined') {
			outlineTree.insertOrUpdate(this, view.state.doc.resolve(pos));
			this.outlineTree = outlineTree;
			for (const [key, nodeview] of headingViewMap) nodeview.updateSymbol();
			btn.addEventListener('click', () => {
				const fold = btn.innerText === '折叠';
				outlineTree.foldOrNot(fold, this.dom);
				btn.innerText = !fold ? '折叠' : '展开';
			});
		}
	}

	updateSymbol() {
		if (this.outlineTree)
			this.listSymbol.innerHTML = this.outlineTree.calculateOrderNumber(
				this.node
			);
	}

	update(node: Node) {
		if (node.type !== this.node.type) return false;
		if (node.attrs.hidden !== this.node.attrs.hidden) {
		}
		this.node = node;
		return true;
	}
	destroy() {
		// this.outlineTree?.removeById(this.node.attrs.id);
		// headingViewMap.delete(this.node.attrs.id);
		// for (const [key, nodeview] of headingViewMap) nodeview.updateSymbol();
		this.dom.remove();
	}
}

export const HeadingViewConstructor: NodeViewConstructor = (...args) =>
	new HeadingView(...args);

export const ListSymbolConstructor: NodeViewConstructor = (...args) =>
	new ListSymbol(...args);
