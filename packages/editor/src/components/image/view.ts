import { NodeViewConstructor } from 'prosemirror-view';
import { BaseNodeView } from '../../utils/view';
import Image from './Image';

export class ImageNodeView extends BaseNodeView {
	constructor(...[node, view, getPos]: Parameters<NodeViewConstructor>) {
		super(node, view, getPos);
		this.component = Image;
		this.render();
	}
}

export const ImageNodeViewConstructor: NodeViewConstructor = (...args) =>
	new ImageNodeView(...args);
