import {
	CSSProperties,
	Children,
	FC,
	ReactElement,
	cloneElement,
	forwardRef,
	useEffect,
	useRef
} from 'react';
export interface Base {
	children: ReactElement;
	arrow?: boolean;
	content: string | ReactElement;
	placement?:
		| 'topLeft'
		| 'top'
		| 'topRight'
		| 'leftTop'
		| 'left'
		| 'leftBottom'
		| 'rightTop'
		| 'right'
		| 'rightBottom'
		| 'bottomLeft'
		| 'bottom'
		| 'bottomRight'
		| 'auto';
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	style?: CSSProperties;
	className?: string;
}

type ActionType = 'hover' | 'click' | 'focus';

interface TriggerProps extends Base {
	action?: ActionType | ActionType[];
}
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

export function generateTrigger() {
	const Trigger = forwardRef<{}, TriggerProps>(({ children }, ref) => {
		const passedProps: Record<string, any> = {};

		const child = Children.only(children);
		const originProps = child.props;

		const $child = useRef<HTMLElement>();

		const mergedChildrenProps = { ...originProps, ...passedProps, ref: $child };

		return cloneElement(child, mergedChildrenProps);
	});
	return Trigger;
}
