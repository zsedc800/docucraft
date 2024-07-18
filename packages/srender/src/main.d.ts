import { ExoticComponent, SuspenseProps } from './interface';
import './jsx';
export * from './interface';
export * from './index';

export const Suspense: ExoticComponent<SuspenseProps>;

// export = Srender;
// types/index.d.ts
import * as CSS from 'csstype';

export interface CSSProperties extends CSS.Properties<string | number> {}
