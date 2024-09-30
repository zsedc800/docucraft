import { Fragment, Node, NodeSpec } from 'prosemirror-model';
import { Command, EditorState } from 'prosemirror-state';
import {
	Decoration,
	DecorationSource,
	EditorView,
	NodeView,
	NodeViewConstructor
} from 'prosemirror-view';
import './style.scss';
import createElement, { updateElement } from '../../createElement';
import { BaseNodeView } from '../../utils/view';

export const taskItem: NodeSpec = {
	content: 'paragraph block*',
	group: 'block',
	attrs: {
		checked: { default: false }
	},
	toDOM(node) {
		return [
			'li',
			{ class: 'task-item' },
			[
				'div',
				{ class: 'task-item-checkbox' },
				[
					'input',
					{
						type: 'checkbox',
						checked: node.attrs.checked ? 'checked' : null,
						contenteditable: 'false',
						tabindex: '-1'
					}
				]
			],
			['p', { class: 'task-item-content' }, 0]
		];
	},
	parseDOM: [
		{
			tag: 'li.task-list-item',
			getAttrs: (dom) => ({
				checked: dom.querySelector<HTMLInputElement>('input[type=checkbox]')
					?.checked
			})
		}
	]
};

export const taskList: NodeSpec = {
	content: 'taskItem+',
	group: 'block',
	toDOM: () => ['ul', { class: 'task-list' }, 0],
	parseDOM: [{ tag: 'ul.task-list' }]
};

export const createTaskList: Command = (state, dispatch) => {
	const { taskList, taskItem } = state.schema.nodes;
	if (dispatch) {
		dispatch(
			state.tr
				.replaceSelectionWith(taskList.create(null, taskItem.createAndFill()))
				.scrollIntoView()
		);
		return true;
	}
	return false;
};

export class TaskItemView extends BaseNodeView {
	contentDOM?: HTMLElement | null | undefined;
	constructor(...args: Parameters<NodeViewConstructor>) {
		const [node, view, getPos] = args;
		super(node, view);
		this.contentDOM = createElement('div', { class: 'task-item-content' });
		this.view = view;
		this.dom = createElement(
			'li',
			{ class: 'task-item' },
			createElement(
				'div',
				{ class: 'task-item-checkbox' },
				createElement('input', {
					type: 'checkbox',
					checked: node.attrs.checked ? 'true' : void 0,
					onchange: (e) => {
						const val = (e.target as HTMLInputElement)?.checked;
						let tr = view.state.tr;
						view.dispatch(
							tr.setNodeAttribute(getPos() as number, 'checked', !!val)
						);
					}
				})
			),
			this.contentDOM
		);
	}
	update(node: Node) {
		if (!super.update(node)) return false;
		updateElement(this.dom, {
			class: `task-item${node.attrs.checked ? ' checked' : ''}`
		});
		return true;
	}
}

export const TaskItemViewConstructor = (
	...args: Parameters<NodeViewConstructor>
) => new TaskItemView(...args);
export default () => {};
