import { HTMLAttributes } from 'react';

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
