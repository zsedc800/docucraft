import { NodeSpec } from 'prosemirror-model';

export const blockTileSpec: NodeSpec = {
	group: 'tile',
	content: 'block',
	inline: false
};

export { BlockTileView, BlockTileViewConstructor } from './view';
