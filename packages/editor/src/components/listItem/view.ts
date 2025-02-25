import { BaseNodeView } from '../../utils/view';
import ListItem from './ListItem';
import { schema } from '../../model';
import { Node } from 'prosemirror-model';
import { NodeViewParameters } from '../../interface';

export class ListItemView extends BaseNodeView {
	inlist?: boolean;
	constructor(...[node, view, getPos]: NodeViewParameters) {
		super(node, view, getPos);
		this.component = ListItem;
		const pos = getPos();
		if (pos) {
			const $pos = view.state.doc.resolve(pos);
			const grandParent = $pos.node(-1);
			this.inlist = grandParent.type === schema.nodes.list_item;
		}
		this.render();
	}

	update(node: Node): boolean {
		const c1 = node.child(0);
		const c2 = this.node.child(0);
		const res = super.update(node);
		if (c1.type !== c2.type)
			this.render({
				hasSublist:
					c1.type === schema.nodes.bullet_list ||
					c1.type === schema.nodes.ordered_list
			});
		return res;
	}
}

export const ListItemViewConstructor = (...args: NodeViewParameters) =>
	new ListItemView(...args);
