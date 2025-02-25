import { BaseNodeView } from '../../utils/view';
import ImageGallery from './ImageGallery';
import { ImageItem, NodeViewParameters } from '../../interface';

export class ImageGalleryView extends BaseNodeView {
	constructor(...[node, view, getPos]: NodeViewParameters) {
		super(node, view, getPos);
		this.component = ImageGallery;
		this.render();
	}

	setNodeAttribute(key: string, val: any) {
		if (key !== 'src') return super.setNodeAttribute(key, val);
		super.setNodeAttribute('images', [val]);
	}

	addImage = (src: ImageItem) => {
		const images = this.node.attrs.images;
		this.setNodeAttribute('images', images.concat(src));
	};
}

export const ImageGalleryViewConstructor = (...args: NodeViewParameters) =>
	new ImageGalleryView(...args);
