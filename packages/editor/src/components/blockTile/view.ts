import { NodeViewConstructor } from 'prosemirror-view';
import { BaseNodeView } from '../../utils/view';
import BlockTile from './BlockTile';

export class BlockTileView extends BaseNodeView {
	constructor(...args: Parameters<NodeViewConstructor>) {
		const [node, view, getPos] = args;
		super(node, view, getPos);
		this.component = BlockTile;
		this.render();
	}
}

export const BlockTileViewConstructor: NodeViewConstructor = (...args) =>
	new BlockTileView(...args);
