import { Fiber, FiberTag, RootFiberNode } from './interface';
import { batchedUpdates } from './reconciler/update';

const nonBubblingEvents = [
	// 焦点事件
	'onFocus',
	'onBlur',

	// 鼠标事件
	'onMouseEnter',
	'onMouseLeave',

	// 表单事件
	'onSubmit',
	'onReset',

	// 媒体事件
	'onPlay',
	'onPause',
	'onPlaying',
	'onWaiting',
	'onSeeking',
	'onSeeked',
	'onEnded',

	// 滚动事件
	'onScroll',

	// 页面生命周期事件
	'onLoad',
	'onUnload',
	'onError',
	'onBeforeUnload',

	// 拖拽事件
	'onDragEnter',
	'onDragLeave',

	// 动画和转换事件
	'onAnimationStart',
	'onAnimationEnd',
	'onAnimationIteration',
	'onTransitionStart',
	'onTransitionEnd'
] as const;

const bubblingEvents = [
	// 鼠标事件
	'onClick',
	'onDoubleClick',
	'onMouseDown',
	'onMouseUp',
	'onMouseMove',
	'onMouseOver',
	'onMouseOut',
	'onContextMenu',

	// 键盘事件
	'onKeyDown',
	'onKeyPress',
	'onKeyUp',

	// 输入事件
	'onBeforeInput',
	'onInput',
	'onChange',
	'onSelect',
	'onCompositionEnd',
	'onCompositionStart',
	'onFocusIn', // focusin 会冒泡
	'onFocusOut', // focusout 会冒泡

	// 表单事件
	'onInvalid',

	// 拖拽事件
	'onDrag',
	'onDragStart',
	'onDragEnd',
	'onDragOver',
	'onDrop',

	// 剪切板事件
	'onCopy',
	'onCut',
	'onPaste',

	// 触摸事件
	'onTouchStart',
	'onTouchMove',
	'onTouchEnd',
	'onTouchCancel',

	// 动画和转换事件
	'onTransitionRun',
	'onTransitionCancel',

	// 其他事件
	'onWheel', // 滚轮事件
	'onResize', // 窗口大小调整
	'onAnimationCancel',
	'onAnimationEnd',
	'onAnimationIteration',
	'onAnimationStart'
] as const;

export type EventName =
	| (typeof bubblingEvents)[number]
	| (typeof nonBubblingEvents)[number];

class SytheticEvent {
	private isPropStopped = false;
	private isPrevented = false;
	currentTarget: Element | null = null;
	constructor(public nativeEvent: Event) {}

	stopPropagation() {
		this.isPropStopped = true;
		this.nativeEvent.stopPropagation();
	}
	preventDefault() {
		this.isPrevented = true;
		this.nativeEvent.preventDefault();
	}

	get isPropagationStopped() {
		return this.isPropStopped;
	}
	get isDefaultPrevented() {
		return this.isPrevented;
	}
}

function cloneEventWithCustomProperties(
	originalEvent: Event,
	customProps: Record<any, any>
) {
	// const clonedEvent = new (originalEvent.constructor as any)(
	// 	originalEvent.type,
	// 	originalEvent
	// );

	// 使用 defineProperty 添加不可枚举的自定义属性
	// Object.keys(customProps).forEach((key) => {
	// 	Object.defineProperty(clonedEvent, key, {
	// 		value: customProps[key],
	// 		enumerable: false, // 设为不可枚举
	// 		writable: true,
	// 		configurable: true
	// 	});
	// });

	const event = new SytheticEvent(originalEvent);

	return new Proxy(event, {
		get(target, prop) {
			if (prop in target) return (target as any)[prop];

			if (prop in customProps) return (customProps as any)[prop];
			return (originalEvent as any)[prop];
		},
		set(target, prop, val) {
			(event as any)[prop] = val;
			return true;
		}
	});
}

export const domMap = new WeakMap<HTMLElement, Fiber>();

function isTextInput(element: HTMLInputElement) {
	return (
		element.tagName === 'INPUT' &&
		(element.type === 'text' ||
			element.type === 'password' ||
			element.type === 'email' ||
			element.type === 'search')
	);
}

function getEventHandler(
	eventName: EventName,
	props: Record<string, any>,
	e: Event
) {
	let handler = props[eventName];
	if (isTextInput(e.target as HTMLInputElement)) {
		if (eventName === 'onInput') handler = props['onChange'];
		else if (eventName === 'onChange') handler = null;
	}

	return handler;
}

function getDirectChildren(fiber: Fiber) {
	let queue = [fiber];
	while (queue.length) {
		const fiber = queue.shift();
		if (
			fiber?.tag !== FiberTag.HostComponent &&
			fiber?.tag !== FiberTag.Portal
		) {
			let node = fiber?.child;
			while (node) {
				queue.push(node);
				node = node.sibling;
			}
		} else {
			return fiber.stateNode as HTMLElement;
		}
	}
	return null;
}

export const registerEvent = (root: HTMLElement | Document) => {
	const listener =
		(eventName: EventName, capture = false) =>
		(e: Event) => {
			let node = e.target as HTMLElement;
			// const fiber = domMap.get(node);
			let current: Fiber | null | undefined = domMap.get(node);

			const clonedEvent = cloneEventWithCustomProperties(e, {
				target: e.target
			});
			while (!current && node) {
				node = node.parentNode as HTMLElement;
				current = domMap.get(node);
			}

			while (current) {
				if (
					current.tag === FiberTag.HostComponent &&
					!clonedEvent.isPropagationStopped
				) {
					const handler = getEventHandler(eventName, current.pendingProps, e);
					clonedEvent.currentTarget = current.stateNode as Element;

					if (handler) {
						batchedUpdates(handler, clonedEvent);
					}
					if (capture) break;
				}
				if (current.tag === FiberTag.HostRoot) {
					const { container } = current.stateNode as RootFiberNode;
					let node: HTMLElement | null = container,
						f;

					while (!f && node) {
						f = domMap.get(node);
						node = node.parentNode as HTMLElement;
					}

					if (f) {
						current = f;
						continue;
					}
				}
				current = current.parent;
			}
		};

	for (const eventName of bubblingEvents) {
		const event = eventName.toLowerCase().slice(2);
		root.addEventListener(event, listener(eventName), false);
	}
	for (const eventName of nonBubblingEvents) {
		const event = eventName.toLowerCase().slice(2);
		root.addEventListener(event, listener(eventName, true), true);
	}
};
