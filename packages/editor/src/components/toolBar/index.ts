import { EditorState, PluginView, Plugin, PluginKey } from 'prosemirror-state';
import { MenuGroup, MenuGroupSpec } from './menuGroup';
import { EditorView } from 'prosemirror-view';
import { createCodeBlockCmd } from '../codeBlock';
import { createTaskList } from '../taskList';
import { createTable, mergeCells } from '../tables/commands';
import { insertMath } from '../katex';
import {
	applyBold,
	applyColor,
	applyLinethrough,
	applyUnderline,
	applylink
} from './commands';
import { FloatBar } from './floatBar';
import { Tooltip } from '../tooltip';
import { createElement, render, useEffect, useState } from '@docucraft/srender';

export interface ToolBarSpec {
	groups: MenuGroupSpec[];
	class?: string;
}

export class ToolBar implements PluginView {
	dom: HTMLElement;
	private groups: MenuGroup[];
	constructor(
		private view: EditorView,
		private spec: ToolBarSpec
	) {
		const dom = document.createElement('div');
		dom.setAttribute('class', this.spec.class || '');
		dom.classList.add('toolbar');
		this.dom = dom;

		this.groups = this.spec.groups.map(
			(menuGroupSpec) => new MenuGroup(this.view, menuGroupSpec)
		);
		this.groups.forEach((menuGroup) => dom.appendChild(menuGroup.dom));
		this.render();
	}

	render() {
		if (this.view.dom.parentNode) {
			this.view.dom.parentNode.insertBefore(this.dom, this.view.dom);
		}
	}

	update(view: EditorView, state: EditorState) {
		this.view = view;
		this.groups.forEach((group) => group.update(view, state));
	}

	destroy() {
		this.dom.parentNode?.removeChild(this.dom);
	}
}

export const buildToolbar = () => {
	let toolbar: ToolBar | null;
	const toolbarPlugin = new Plugin({
		key: new PluginKey('toolbar'),

		view(view) {
			toolbar = new ToolBar(view, {
				groups: [
					{
						menus: [
							{
								label: '插入代码块',
								handler({ state, dispatch, view }, event) {
									createCodeBlockCmd(state, dispatch, view);
								}
							},
							{
								label: '插入tasklist',
								handler({ state, dispatch, view }) {
									createTaskList(state, dispatch, view);
								}
							},
							{
								label: '插入表格',
								handler({ state, dispatch, view }) {
									createTable(3, 4)(state, dispatch, view);
									// insertTable(state, dispatch);
								}
							},
							{
								label: '合并单元格',
								handler({ state, dispatch, view }) {
									mergeCells(state, dispatch, view);
								}
							},
							{
								label: '插入公式',
								handler({ view }) {
									const formula = prompt('输入一条 LaTex 公式: ');
									// console.log(escapeLatex(formula));

									if (formula) insertMath(view, formula);
								}
							}
						]
					}
				]
			});

			const onMouseDown = (e: Event) => {
				const { clientX: x1, clientY: y1 } = e as MouseEvent;
				const onMouseup = (e: Event) => {
					const { clientX: x2, clientY: y2 } = e as MouseEvent;
					const sel = view.state.selection;
					if (!sel.empty && (Math.abs(x1 - x2) > 5 || Math.abs(y1 - y2) > 5)) {
						const from = view.coordsAtPos(sel.$from.pos);
						const to = view.coordsAtPos(sel.$to.pos);
						const rect = {
							left: Math.min(from.left, to.left),
							right: Math.max(from.right, to.right),
							top: Math.min(from.top, to.top),
							bottom: Math.max(from.bottom, to.bottom)
						};
						tooltip.showAt({
							...rect,
							width: Math.abs(rect.left - rect.right),
							height: Math.abs(rect.top - rect.bottom)
						});
					} else if (tooltip.visible) {
						tooltip.hide();
					}
					view.root.removeEventListener('mouseup', onMouseup);
				};
				view.root.addEventListener('mouseup', onMouseup);
			};
			view.root.addEventListener('mousedown', onMouseDown);
			const floatBar = new FloatBar(view, {
				menus: [
					{
						label: '加粗',
						handler({ view }) {
							applyBold(view);
						}
					},
					{
						label: '链接',
						handler({ view }) {
							applylink('www.baidu.com')(view);
						}
					},
					{
						label: '下划线',
						handler({ view }) {
							applyUnderline(view);
						}
					},
					{
						label: '删除线',
						handler({ view }) {
							applyLinethrough(view);
						}
					},
					{
						label: '颜色',
						handler({ view }) {
							applyColor('red')(view);
						}
					},
					{
						label: '颜色‘',
						handler({ view }) {
							applyColor()(view);
						}
					}
				]
			});
			const tooltip = new Tooltip();
			tooltip.content(floatBar.dom);
			return {
				dom: toolbar.dom,
				update(view, prevState) {
					const sel = view.state.selection;
					if (tooltip.visible && !sel.eq(prevState.selection) && sel.empty)
						tooltip.hide();
					toolbar?.update(view, prevState);
				},
				destroy() {
					toolbar?.destroy();
					view.root.removeEventListener('mousedown', onMouseDown);
				}
			};
		}
	});
	return {
		plugin: toolbarPlugin,
		update: (view: EditorView, state: EditorState) =>
			toolbar?.update(view, state),
		destroy: () => {
			toolbar?.destroy();
			toolbar = null;
		}
	};
};
