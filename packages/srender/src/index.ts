import { createElement, FRAGMENT as Fragment } from './element';
import { render } from './reconciler';
export * from './hooks';
// export type * from './jsx';
export * from './interface';

export default {
	createElement,
	render,
	Fragment
};

export { createElement, render, Fragment };
