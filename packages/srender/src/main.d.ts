import { forwardRef as Rff, Suspense as Suspen } from 'react';
import {
	ExoticComponent,
	ForwardRefExoticComponent,
	SuspenseProps
} from './interface';
import './jsx';
export * from './interface';
export * from './index';

export const Suspense: typeof Suspen;

// export const forwardRef: <R, P>(r: R) => ForwardRefExoticComponent<R & P>;

export const forwardRef: typeof Rff;

// export = Srender;
// types/index.d.ts
export {
	CSSProperties,
	ReactNode,
	FC,
	ForwardRefExoticComponent,
	ForwardRefRenderFunction
} from 'react';
