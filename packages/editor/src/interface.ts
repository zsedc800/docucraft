import { HTMLAttributes } from 'react';

export interface ImageItem {
	src: string;
	title?: string;
	subTitle?: string;
	description?: string;
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
