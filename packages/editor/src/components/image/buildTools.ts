import { CSSProperties } from '@docucraft/srender';
import { BaseNodeView } from '../../utils/view';
import { setStyles } from '../../utils/domUtils';
import { ImageNodeView } from './view';
import { CropProps, ResizeProps } from './interface';

type Placement =
	| 'tl'
	| 'tr'
	| 'bl'
	| 'br'
	| 'top'
	| 'right'
	| 'bottom'
	| 'left';
export function initResizer(box: HTMLElement, { onResize }: ResizeProps) {
	let dragging = false;
	const text = box.querySelector('.text') as HTMLElement;
	function handleMouseDown(placement: Placement) {
		const win = box.ownerDocument.defaultView ?? window;
		let boxStyle: CSSProperties = {};
		const { width, height, x, y } = box.getBoundingClientRect();
		switch (placement) {
			case 'tl':
				boxStyle = { right: 0, bottom: 0 };
				break;
			case 'tr':
				boxStyle = { left: 0, bottom: 0 };
				break;
			case 'bl':
				boxStyle = { top: 0, right: 0 };
				break;
			case 'br':
				boxStyle = { left: 0, top: 0 };
		}

		let w = width,
			h = height;
		dragging = true;
		box.classList.add('dragging');

		function move(e: MouseEvent) {
			if (!e.buttons) return finish();

			if (!dragging) return;
			const { clientX } = e;
			if (placement === 'br' || placement === 'tr') {
				w = clientX - x;
			} else if (placement === 'bl' || placement === 'tl') {
				w = width - (clientX - x);
			}
			h = Math.round(w * (height / width));
			setStyles(box, {
				...boxStyle,
				width: w,
				height: h
			});
			text.textContent = `${Math.round(w)} x ${h}`;
		}

		function finish() {
			win.removeEventListener('mousemove', move);
			win.removeEventListener('mouseup', finish);
			if (dragging) {
				dragging = false;
				box.classList.remove('dragging');
				text.textContent = '';
				onResize && onResize(w);
			}
		}

		win.addEventListener('mousemove', move);
		win.addEventListener('mouseup', finish);
	}
	function onMouseDown(e: MouseEvent) {
		const placement = (e.target as HTMLElement)?.getAttribute('data-placement');
		if (placement) handleMouseDown(placement as Placement);
	}
	box.addEventListener('mousedown', onMouseDown);
}

export function initCroper(box: HTMLElement, { nodeView, onCrop }: CropProps) {
	let dragging = false,
		minWith = 21,
		minHeight = 21;
	const { dom, node } = nodeView;
	const { clip, origin } = node.attrs;
	const cropArea = dom.querySelector('.crop-area') as HTMLElement;
	// const cropBg = dom.querySelector('.crop-bg') as HTMLElement;
	const img = dom.querySelector('.image') as HTMLElement;
	const imageWrapper = dom.querySelector('.image-wrapper') as HTMLElement;
	cropArea.appendChild(img.cloneNode());
	// cropBg.appendChild(img.cloneNode());
	const { x, y, width, height } = imageWrapper.getBoundingClientRect();
	const { x: x1, y: y1, width: w, height: h } = box.getBoundingClientRect();
	let left = x1 - x,
		right = width - left - w,
		top = y1 - y,
		bottom = height - top - h;

	if (clip) {
		left = clip.left;
		top = clip.top;
		right = origin.width - left - clip.width;
		bottom = origin.height - top - clip.height;
		const w = clip.width;
		const h = clip.height;
		setStyles(cropArea, {
			clipPath: `path("M${left},${top} L${left + w},${top} L${left + w},${top + h} L${left},${top + h}")`
		});
	}

	setStyles(box, { left, right, top, bottom });

	function adjustCursor() {
		if (left > 0 || top > 0 || right > 0 || bottom > 0)
			box.style.cursor = 'move';
		else box.style.cursor = 'initial';
	}

	adjustCursor();

	function handleMouseDown(placement: Placement | 'box', event: MouseEvent) {
		const win = box.ownerDocument.defaultView ?? window;
		let w = width,
			h = height;
		dragging = true;
		box.classList.add('dragging');
		let { clientX: startX, clientY: startY } = event;
		function move(e: MouseEvent) {
			if (!e.buttons) return finish();

			if (!dragging) return;
			const { clientX, clientY } = e;

			let tmp = 0;
			if (placement === 'br' || placement === 'tr' || placement === 'right') {
				tmp = width + x - clientX;
				right = tmp > 0 ? (width > left + tmp + minWith ? tmp : right) : 0;
			} else if (
				placement === 'bl' ||
				placement === 'tl' ||
				placement === 'left'
			) {
				tmp = clientX - x;
				left = tmp > 0 ? (width > right + tmp + minWith ? tmp : left) : 0;
			}

			if (placement === 'tl' || placement === 'tr' || placement === 'top') {
				tmp = clientY - y;
				top = tmp > 0 ? (height > tmp + bottom + minHeight ? tmp : top) : 0;
			} else if (
				placement === 'bl' ||
				placement === 'bottom' ||
				placement === 'br'
			) {
				tmp = height + y - clientY;
				bottom = tmp > 0 ? (height > tmp + top + minHeight ? tmp : bottom) : 0;
			} else if (placement === 'box') {
				tmp = clientX - startX;
				if (left + tmp > 0 && right - tmp > 0) {
					startX = clientX;
					left += tmp;
					right -= tmp;
				}
				tmp = clientY - startY;
				if (top + tmp > 0 && bottom - tmp > 0) {
					startY = clientY;
					top += tmp;
					bottom -= tmp;
				}
			}

			w = width - left - right;
			h = height - top - bottom;
			setStyles(box, {
				left,
				top,
				right,
				bottom
			});

			setStyles(cropArea, {
				clipPath: `path("M${left},${top} L${left + w},${top} L${left + w},${top + h} L${left},${top + h}")`
			});
		}

		function finish() {
			win.removeEventListener('mousemove', move);
			win.removeEventListener('mouseup', finish);
			if (dragging) {
				dragging = false;
				box.classList.remove('dragging');
				onCrop && onCrop({ left, top, width: w, height: h });

				adjustCursor();
			}
		}

		win.addEventListener('mousemove', move);
		win.addEventListener('mouseup', finish);
	}
	function onMouseDown(e: MouseEvent) {
		let target = e.target as HTMLElement;
		if (!target) return;
		if (target.nodeName === 'path') target = target.parentElement!;
		const placement =
			target === box ? 'box' : target.getAttribute('data-placement');
		if (placement) handleMouseDown(placement as Placement, e);
	}
	box.addEventListener('mousedown', onMouseDown);
}
