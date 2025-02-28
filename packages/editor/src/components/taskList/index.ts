import { Command } from 'prosemirror-state';
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

export * from './view';
export default () => {};
