import { BaseNodeView } from '../../utils/view';
import Video from './Video';
import { NodeViewConstructor, NodeViewParameters } from '../../interface';

export class VideoNodeView extends BaseNodeView {
	constructor(...[node, view, getPos]: NodeViewParameters) {
		super(node, view, getPos);
		this.component = Video;
		this.render();
	}
}

export const VideoNodeViewConstructor: NodeViewConstructor = (...args) =>
	new VideoNodeView(...args);
