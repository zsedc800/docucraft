import { Decoration, DecorationSource, NodeView } from 'prosemirror-view';
import { HTMLAttributes } from 'react';
import EditorView from './EditorView';
import { Node } from 'prosemirror-model';

export interface ImageItem {
	src: string;
	title?: string;
	subTitle?: string;
	description?: string;
	urls?: Partial<{
		raw: string;
		full: string;
		regular: string;
		small: string;
		thumb: string;
		small_s3: string;
	}>;
}

export type Overrides<T, U> = Omit<T, keyof U> & U;

export type BaseProps<T = {}, E extends HTMLElement = HTMLElement> = Overrides<
	HTMLAttributes<E>,
	T
>;

export type BaseComponentProps<T = {}> = BaseProps<
	T & { component: keyof HTMLElementTagNameMap },
	HTMLElement
>;

export type DOMNode = InstanceType<typeof window.Node>;

export type NodeViewParameters = readonly [
	node: Node,
	view: EditorView,
	getPos: () => number | undefined,
	decorations: readonly Decoration[],
	innerDecorations: DecorationSource
];

export type NodeViewConstructor = (...args: NodeViewParameters) => NodeView;
