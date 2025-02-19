import { Node, NodeSpec, NodeType, Schema } from 'prosemirror-model';
import {
	EditorState,
	NodeSelection,
	Selection,
	TextSelection
} from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { BaseNodeView, getNodeView } from './view';

let view: { current?: EditorView } = {};
export const addView = (v: EditorView) => (view.current = v);
export const getView = () => view.current;

export * from './base';

export function getSelectionRect(view: EditorView) {
	const { selection } = view.state;

	// 获取 DOM 节点和偏移
	const start = view.domAtPos(selection.from);
	const end = view.domAtPos(selection.to);

	// 创建 Range 并设置起点和终点
	const range = document.createRange();
	if (selection.empty) {
		const { node } = start;
		if (node instanceof HTMLElement) return node.getBoundingClientRect();
	}
	range.setStart(start.node, start.offset);
	range.setEnd(end.node, end.offset);

	return range.getBoundingClientRect();
}

export function selectionContainsOnlyText(
	state: EditorState,
	...whitelist: NodeType[]
) {
	const { selection } = state;

	const whitelistNode: Node[] = [];
	// 如果选区不是 TextSelection，直接返回 false
	if (!(selection instanceof TextSelection)) {
		return [false, whitelistNode] as const;
	}

	// 遍历选区范围内的所有节点
	let onlyText = true;
	const { from, to } = selection;
	state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
		let white = false;
		if (whitelist.includes(node.type)) {
			whitelistNode.push(node);
			white = true;
		}
		if (
			!node.isText &&
			!white &&
			(pos >= Math.min(from, to) || pos + node.nodeSize <= Math.max(from, to))
		) {
			onlyText = false;
			return false;
		}
	});

	return [onlyText, whitelistNode] as const;
}

export function hasChildOfType(node: Node, type: NodeType) {
	let found = false;
	node.descendants((child) => {
		if (child.type === type) {
			found = true;
			return false; // 停止遍历
		}
	});
	return found;
}

export function findParentNode(selection: Selection, types: NodeType[]) {
	let node: Node | null = null;
	const { $from } = selection;
	if (selection instanceof NodeSelection) {
		node = selection.node;
		if (types.includes(node.type)) return node;
	}

	for (let d = $from.depth; d >= 0; d--) {
		node = $from.node(d);
		if (types.includes(node.type)) break;
	}
	return node;
}

export function fixSelection(view: EditorView, from: number, to: number) {
	const startResolved = view.domAtPos(from);
	const endResolved = view.domAtPos(to);
	try {
		const range = document.createRange();
		range.setStart(startResolved.node, startResolved.offset);
		if (from === to) {
			range.collapse(true);
		} else {
			range.setEnd(endResolved.node, endResolved.offset);
		}
		const nativeSelection = window.getSelection();
		if (nativeSelection) {
			nativeSelection.removeAllRanges();
			nativeSelection.addRange(range);
		}
	} catch (error) {
		console.error('Failed to change native selection: ', error);
	}
}

const types = ['table', 'timelineSeparator', 'paragraph'];
export const selectInTypes = ({ state: { schema } }: EditorView) =>
	types.map((key) => schema.nodes[key]);

type FunctionKeys<T> = Exclude<
	{
		[K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
	}[keyof T],
	undefined
>;

export function callNodeView<
	T extends BaseNodeView = BaseNodeView,
	K extends FunctionKeys<T> = FunctionKeys<T>
>(view: EditorView, key: K): T[K] | undefined {
	const { state } = view;
	const { selection } = state;
	const node = findParentNode(selection, selectInTypes(view));
	if (node) {
		const nodeView = getNodeView(node.attrs.blockId) as T;
		if (nodeView) {
			const fn = nodeView[key];
			return typeof fn === 'function' ? fn.bind(nodeView) : void 0;
		}
	}
}

export function setSelectIn(view: EditorView, selectIn: boolean = false) {
	const { state } = view;
	const { selection } = state;
	const node = findParentNode(selection, selectInTypes(view));
	if (node) getNodeView(node.attrs.blockId)?.setProps({ selectIn });
	return node;
}
