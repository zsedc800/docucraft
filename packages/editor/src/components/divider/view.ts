import { BaseNodeView } from '../../utils/view';
import Divider from './Divider';
import { NodeViewParameters } from '../../interface';

export default class DividerView extends BaseNodeView {
	constructor(...[node, view, getPos]: NodeViewParameters) {
		super(node, view, getPos);
		this.component = Divider;
		this.render();
	}
}
