import {
	ReactNode,
	forwardRef as Rff,
	Suspense as Suspen,
	ReactPortal
} from 'react';
// import {
// 	ExoticComponent,
// 	ForwardRefExoticComponent,
// 	SuspenseProps
// } from './interface';
import './jsx';
import { ReactElement } from 'react';
// export * from './interface';
export * from './index';

export const Suspense: typeof Suspen;

// export const forwardRef: <R, P>(r: R) => ForwardRefExoticComponent<R & P>;

export const forwardRef: typeof Rff;
export const createPortal: (node: ReactElement, ele: HTMLElement) => ReactNode;
// export = Srender;
// types/index.d.ts
export {
	CSSProperties,
	ReactNode,
	FC,
	ForwardRefExoticComponent,
	ForwardRefRenderFunction,
	ReactElement,
	SyntheticEvent,
	MouseEvent,
	MouseEventHandler,
	HTMLAttributes
} from 'react';
