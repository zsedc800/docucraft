import { Fiber, FiberTag } from './interface';
import { batchedUpdates } from './reconciler/update';

const events = [
	'onCopy',
	'onCopyCapture',
	'onCutCapture',
	'onPaste',
	'onPasteCapture',
	'onCompositionEnd',
	'onCompositionEndCapture',
	'onCompositionStart',
	'onCompositionStartCapture',
	'onCompositionUpdate',
	'onCompositionUpdateCapture',
	'onFocus',
	'onCut',
	'onFocusCapture',
	'onBlur',
	'onBlurCapture',
	'onChange',
	'onChangeCapture',
	'onBeforeInput',
	'onBeforeInputCapture',
	'onInput',
	'onInputCapture',
	'onReset',
	'onResetCapture',
	'onSubmit',
	'onSubmitCapture',
	'onInvalid',
	'onInvalidCapture',
	'onLoad',
	'onLoadCapture',
	'onError',
	'onErrorCapture',
	'onKeyDown',
	'onKeyDownCapture',
	'onKeyPress',
	'onKeyPressCapture',
	'onKeyUp',
	'onKeyUpCapture',
	'onAbort',
	'onAbortCapture',
	'onCanPlay',
	'onCanPlayCapture',
	'onCanPlayThrough',
	'onCanPlayThroughCapture',
	'onDurationChange',
	'onDurationChangeCapture',
	'onEmptied',
	'onEmptiedCapture',
	'onEncrypted',
	'onEncryptedCapture',
	'onEnded',
	'onEndedCapture',
	'onLoadedData',
	'onLoadedDataCapture',
	'onLoadedMetadata',
	'onLoadedMetadataCapture',
	'onLoadStart',
	'onLoadStartCapture',
	'onPause',
	'onPauseCapture',
	'onPlay',
	'onPlayCapture',
	'onPlaying',
	'onPlayingCapture',
	'onProgress',
	'onProgressCapture',
	'onRateChange',
	'onRateChangeCapture',
	'onResize',
	'onResizeCapture',
	'onSeeked',
	'onSeekedCapture',
	'onSeeking',
	'onSeekingCapture',
	'onStalled',
	'onStalledCapture',
	'onSuspend',
	'onSuspendCapture',
	'onTimeUpdate',
	'onTimeUpdateCapture',
	'onVolumeChange',
	'onVolumeChangeCapture',
	'onWaiting',
	'onWaitingCapture',
	'onAuxClick',
	'onAuxClickCapture',
	'onClick',
	'onClickCapture',
	'onContextMenu',
	'onContextMenuCapture',
	'onDoubleClick',
	'onDoubleClickCapture',
	'onDrag',
	'onDragCapture',
	'onDragEnd',
	'onDragEndCapture',
	'onDragEnter',
	'onDragEnterCapture',
	'onDragExit',
	'onDragExitCapture',
	'onDragLeave',
	'onDragLeaveCapture',
	'onDragOver',
	'onDragOverCapture',
	'onDragStart',
	'onDragStartCapture',
	'onDrop',
	'onDropCapture',
	'onMouseDown',
	'onMouseDownCapture',
	'onMouseEnter',
	'onMouseLeave',
	'onMouseMove',
	'onMouseMoveCapture',
	'onMouseOut',
	'onMouseOutCapture',
	'onMouseOver',
	'onMouseOverCapture',
	'onMouseUp',
	'onMouseUpCapture',
	'onSelect',
	'onSelectCapture',
	'onTouchCancel',
	'onTouchCancelCapture',
	'onTouchEnd',
	'onTouchEndCapture',
	'onTouchMove',
	'onTouchMoveCapture',
	'onTouchStart',
	'onTouchStartCapture',
	'onPointerDown',
	'onPointerDownCapture',
	'onPointerMove',
	'onPointerMoveCapture',
	'onPointerUp',
	'onPointerUpCapture',
	'onPointerCancel',
	'onPointerCancelCapture',
	'onPointerEnter',
	'onPointerLeave',
	'onPointerOver',
	'onPointerOverCapture',
	'onPointerOut',
	'onPointerOutCapture',
	'onGotPointerCapture',
	'onGotPointerCaptureCapture',
	'onLostPointerCapture',
	'onLostPointerCaptureCapture',
	'onScroll',
	'onScrollCapture',
	'onWheel',
	'onWheelCapture',
	'onAnimationStart',
	'onAnimationStartCapture',
	'onAnimationEnd',
	'onAnimationEndCapture',
	'onAnimationIteration',
	'onAnimationIterationCapture',
	'onTransitionEnd',
	'onTransitionEndCapture'
];

export const domMap = new WeakMap<HTMLElement, Fiber>();

export const registerEvent = (root: HTMLElement) => {
	const listener = (eventName: string) => (e: Event) => {
		const fiber = domMap.get(e.target as HTMLElement);
		let current: Fiber | null | undefined = fiber;

		while (current) {
			if (current.tag === FiberTag.HostComponent) {
				const handler = current.pendingProps[eventName];
				handler && batchedUpdates(handler, e);
			}
			current = current.parent;
		}
	};

	for (const eventName of events) {
		const event = eventName.toLowerCase().slice(2);
		root.addEventListener(event, listener(eventName), false);
	}
};
