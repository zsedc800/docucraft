import {
	ReactNode,
	forwardRef as Rff,
	Suspense as Suspen,
	ReactPortal,
	useImperativeHandle as useImp,
	createContext as CCtx,
	useContext as UseCtx
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
export const createContext: typeof CCtx;
export const useContext: typeof UseCtx;

// export const forwardRef: <R, P>(r: R) => ForwardRefExoticComponent<R & P>;

export const forwardRef: typeof Rff;
export const createPortal: (node: ReactElement, ele: HTMLElement) => ReactNode;
export const useImperativeHandle: typeof useImp;
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
	HTMLAttributes,
	ForwardedRef,
	ElementType
} from 'react';
