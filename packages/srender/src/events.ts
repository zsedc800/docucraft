import { Fiber, FiberTag } from './interface';
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
];

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
	'onInput',
	'onChange',
	'onSelect',
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
];

function cloneEventWithCustomProperties(
	originalEvent: Event,
	customProps: Record<any, any>
) {
	const clonedEvent = new (originalEvent.constructor as any)(
		originalEvent.type,
		originalEvent
	);

	// 使用 defineProperty 添加不可枚举的自定义属性
	Object.keys(customProps).forEach((key) => {
		Object.defineProperty(clonedEvent, key, {
			value: customProps[key],
			enumerable: false, // 设为不可枚举
			writable: true,
			configurable: true
		});
	});

	return clonedEvent;
}

export const domMap = new WeakMap<HTMLElement, Fiber>();

export const registerEvent = (root: HTMLElement | Document) => {
	const listener =
		(eventName: string, capture = false) =>
		(e: Event) => {
			const fiber = domMap.get(e.target as HTMLElement);
			let current: Fiber | null | undefined = fiber;
			while (current) {
				if (current.tag === FiberTag.HostComponent) {
					const handler = current.pendingProps[eventName];
					if (handler) {
						batchedUpdates(
							handler,
							cloneEventWithCustomProperties(e, {
								target: e.target,
								currentTarget: current.stateNode
							})
						);
					}
					if (capture) break;
				}
				current = current.parent;
			}
		};

	for (const eventName of bubblingEvents) {
		const event = eventName.toLowerCase().slice(2);
		root.addEventListener(event, listener(eventName), false);
	}
	// for (const eventName of nonBubblingEvents) {
	// 	const event = eventName.toLowerCase().slice(2);
	// 	root.addEventListener(event, listener(eventName, true), true);
	// }
};
