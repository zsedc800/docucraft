import { NodeViewConstructor } from 'prosemirror-view';
import { BaseNodeView } from '../../utils/view';
import Video from './Video';

export class VideoNodeView extends BaseNodeView {
	constructor(...[node, view, getPos]: Parameters<NodeViewConstructor>) {
		super(node, view, getPos);
		this.component = Video;
		this.render();
	}
}

export const VideoNodeViewConstructor: NodeViewConstructor = (...args) =>
	new VideoNodeView(...args);
