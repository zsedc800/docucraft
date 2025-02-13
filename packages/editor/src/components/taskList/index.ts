import { Command } from 'prosemirror-state';
import { NodeViewConstructor } from 'prosemirror-view';
import { BaseNodeView } from '../../utils/view';
import TaskItem from './TaskItem';
import { createNode, createNodeAndFill } from '../../commands';
import './style.scss';

export { taskItem, taskList } from './schema';

export const createTaskList: Command = (state, dispatch) => {
	const { taskList, taskItem } = state.schema.nodes;
	if (dispatch) {
		dispatch(
			state.tr
				.replaceSelectionWith(
					createNode(taskList, null, createNodeAndFill(taskItem))
				)
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
