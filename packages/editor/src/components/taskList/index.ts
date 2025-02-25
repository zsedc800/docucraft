import { Command } from 'prosemirror-state';
import { BaseNodeView } from '../../utils/view';
import TaskItem from './TaskItem';
import { createNode, createNodeAndFill } from '../../commands';
import './style.scss';
import { NodeViewParameters } from '../../interface';

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
	constructor(...args: NodeViewParameters) {
		const [node, view, getPos] = args;
		super(node, view, getPos);
		this.component = TaskItem;
		this.render();
	}
}

export const TaskItemViewConstructor = (...args: NodeViewParameters) =>
	new TaskItemView(...args);
export default () => {};
