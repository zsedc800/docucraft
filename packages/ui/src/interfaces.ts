import { CSSProperties, ReactNode } from 'react';

export type BasicType = string | number | boolean;

export interface ElementProps {
	style?: CSSProperties;
	className?: string;
	children?: ReactNode;
}

export interface Option {
	label: string;
	value: string | number | boolean;
}
