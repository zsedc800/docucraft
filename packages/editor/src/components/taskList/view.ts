import { NodeViewParameters } from '../../interface';
import { BaseNodeView } from '../../utils/view';
import TaskItem from './TaskItem';

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
