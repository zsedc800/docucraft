import { createElement, FRAGMENT as Fragment } from './element';
import { ComponentChildren, FunctionComponent, Ref } from './interface';
import { render } from './reconciler';
export * from './hooks';
export * from './context';
// export type * from './jsx';
export * from './interface';

export const forwardRef =
	<P = {}, T = any>(
		render: (props: P, ref: Ref<T>) => ComponentChildren
	): FunctionComponent<{ ref: Ref<T> } & P> =>
	(props) =>
		render(props, props.ref);

export default {
	createElement,
	render,
	Fragment
};

export { createElement, render, Fragment };
