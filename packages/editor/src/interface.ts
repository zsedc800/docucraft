import { Decoration, DecorationSource, NodeView } from 'prosemirror-view';
import { HTMLAttributes } from 'react';
import EditorView from './EditorView';
import { Mark, Node } from 'prosemirror-model';
import { ReactNode } from '@docucraft/srender';
import { BaseNodeView } from './utils/view';

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

export type MarkViewParameters = readonly [
	Mark: Mark,
	view: EditorView,
	inline: boolean
];

export interface MenuItemConfig {
	Icon?: (props: any) => ReactNode;
	handler: (nodeView: BaseNodeView) => void;
	title: ReactNode;
	suffix?: ReactNode;
}

export type NodeViewConstructor = (...args: NodeViewParameters) => NodeView;
