import { ReactElement, isValidElement } from 'react';
import { Root, createRoot } from 'react-dom/client';
import { prefixName } from '../consts';
import { createElement } from '../utils';

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
	renderRoot: Root;
	tooltip: HTMLElement;
	visible: boolean = false;

	constructor() {
		this.tooltip = createElement('div', { class: `${prefixName}-tooltip` });
		if (!Tooltip.container) {
			const container = createElement('div', {
				class: `${prefixName}-tooltip-container`
			});
			Tooltip.container = container;
			document.body.appendChild(container);
		}
		Tooltip.container.appendChild(this.tooltip);
		this.renderRoot = createRoot(this.tooltip);
		this.tooltip.addEventListener('mouseup', (e) => {
			e.stopPropagation();
			e.preventDefault();
		});
	}

	content(content?: HTMLElement | string | ReactElement) {
		if (typeof content === 'string') this.tooltip.innerHTML = content;
		else if (content instanceof Element) this.tooltip.replaceChildren(content);
		else if (isValidElement(content)) this.renderRoot.render(content);
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

	show(target: HTMLElement, content?: string | HTMLElement | ReactElement) {
		if (!this.tooltip) return;
		this.content(content);
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
