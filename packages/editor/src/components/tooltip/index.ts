import createElement from '../../createElement';
import './style.scss';

export interface Rect {
	left: number;
	right: number;
	top: number;
	bottom: number;
	width: number;
	height: number;
}

export class Tooltip {
	static container: HTMLElement;
	static instance?: Tooltip;
	tooltip: HTMLElement;
	visible: boolean = false;

	constructor() {
		this.tooltip = createElement('div', { class: 'dc-tooltip' });
		if (!Tooltip.container) {
			const container = createElement('div', { class: 'dc-tooltip-container' });
			Tooltip.container = container;
			document.body.appendChild(container);
		}
		Tooltip.container.appendChild(this.tooltip);
		this.tooltip.addEventListener('mouseup', (e) => {
			e.stopPropagation();
			e.preventDefault();
		});
	}

	content(dom: HTMLElement) {
		this.tooltip.replaceChildren(dom);
	}

	showAt(rect: Rect) {
		this.tooltip.style.visibility = 'visible';
		this.tooltip.style.opacity = '1';
		this.visible = true;

		const { height, width } = this.tooltip.getBoundingClientRect();
		const top = rect.top - height - 5;
		const left = rect.left + (rect.width - width) / 2;
		this.tooltip.style.top = top + 'px';
		this.tooltip.style.left = left + 'px';
	}

	show(target: HTMLElement, content?: string | HTMLElement) {
		if (!this.tooltip) return;
		if (!content) {
		} else if (typeof content === 'string') this.tooltip.innerHTML = content;
		else {
			this.tooltip.replaceChildren(content);
		}
		this.tooltip.style.visibility = 'visible';
		this.tooltip.style.opacity = '1';
		this.visible = true;

		const rect = target.getBoundingClientRect();
		const { height, width } = this.tooltip.getBoundingClientRect();
		const top = rect.top - height - 5;
		const left = rect.left + (rect.width - width) / 2;
		this.tooltip.style.top = top + 'px';
		this.tooltip.style.left = left + 'px';
	}

	hide() {
		if (!this.tooltip) return;
		this.tooltip.style.opacity = '0';
		this.tooltip.style.visibility = 'hidden';
		this.visible = false;
	}

	destroy() {
		this.tooltip.parentNode?.removeChild(this.tooltip);
	}

	static get() {
		let instance = Tooltip.instance;
		if (!instance) {
			instance = new Tooltip();
			Tooltip.instance = instance;
		}
		return instance;
	}
}
