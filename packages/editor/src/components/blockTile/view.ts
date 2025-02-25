import { BaseNodeView } from '../../utils/view';
import BlockTile from './BlockTile';
import { NodeViewParameters } from '../../interface';

export class BlockTileView extends BaseNodeView {
	constructor(...args: NodeViewParameters) {
		const [node, view, getPos] = args;
		super(node, view, getPos);
		this.component = BlockTile;
		this.render();
	}
}

export const BlockTileViewConstructor = (...args: NodeViewParameters) =>
	new BlockTileView(...args);
