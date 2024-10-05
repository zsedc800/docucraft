import { Children, ReactElement, ReactNode, cloneElement } from 'react';
interface Props {
	children: ReactElement;
	[k: string]: any;
}
export default ({ children, ...restProps }: Props) => {
	const passedProps: Record<string, any> = {};
	const passedEventList = [
		'onContextMenu',
		'onClick',
		'onMouseDown',
		'onTouchStart',
		'onMouseEnter',
		'onMouseLeave',
		'onFocus',
		'onBlur'
	];

	const mer;
	const child = Children.only(children);

	passedEventList.forEach((eventName) => {
		if (restProps[eventName]) {
			passedProps[eventName] = (...args: any[]) => {
				mergedChildrenProps[eventName]?.(...args);
				restProps[eventName](...args);
			};
		}
	});

	// return Children.map(children, (child, index) => {
	//     return cloneElement(child, {})
	// });
};
