import { CSSProperties } from '@docucraft/srender';
import { BaseNodeView } from '../../utils/view';
import { setStyles } from '../../utils/domUtils';

type Placement = 'tl' | 'tr' | 'bl' | 'br';
export function initResizer(box: HTMLElement, nodeView: BaseNodeView) {
	let dragging = false;
	const text = box.querySelector('.text') as HTMLElement;
	const { setNodeAttribute } = nodeView;
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
				setNodeAttribute('width', w);
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
