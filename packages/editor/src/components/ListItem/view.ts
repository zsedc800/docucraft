import { NodeViewConstructor } from 'prosemirror-view';
import { BaseNodeView } from '../../utils/view';
import ListItem from './ListItem';

export class ListItemView extends BaseNodeView {
	constructor(...[node, view, getPos]: Parameters<NodeViewConstructor>) {
		super(node, view, getPos);
		this.component = ListItem;
		this.render();
	}
}

export const ListItemViewConstructor: NodeViewConstructor = (...args) =>
	new ListItemView(...args);
