import { ViewMutationRecord } from 'prosemirror-view';
import { BaseNodeView } from '../../utils/view';
import Image from './Image';
import { NodeViewParameters } from '../../interface';

export class ImageNodeView extends BaseNodeView {
	constructor(...[node, view, getPos]: NodeViewParameters) {
		super(node, view, getPos);
		this.component = Image;
		this.render();
	}
	ignoreMutation(mutation: ViewMutationRecord): boolean {
		if (super.ignoreMutation(mutation)) return true;
		return true;
	}
}

export const ImageNodeViewConstructor = (...args: NodeViewParameters) =>
	new ImageNodeView(...args);
