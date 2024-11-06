import { Node, NodeSpec } from 'prosemirror-model';
import { Command } from 'prosemirror-state';
import { NodeViewConstructor } from 'prosemirror-view';
import './style.scss';
import createElement, { updateElement } from '../../createElement';
import { BaseNodeView } from '../../utils/view';
import TaskItem from './TaskItem';

export const taskItem: NodeSpec = {
	content: 'paragraph*',
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
	constructor(...args: Parameters<NodeViewConstructor>) {
		const [node, view, getPos] = args;
		super(node, view, getPos);
		this.component = TaskItem;
		this.render();
	}
}

export const TaskItemViewConstructor = (
	...args: Parameters<NodeViewConstructor>
) => new TaskItemView(...args);
export default () => {};
