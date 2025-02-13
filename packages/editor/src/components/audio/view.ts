import { NodeViewConstructor } from 'prosemirror-view';
import { BaseNodeView } from '../../utils/view';
import Audio from './Audio';

export class AudioNodeView extends BaseNodeView {
	constructor(...[node, view, getPos]: Parameters<NodeViewConstructor>) {
		super(node, view, getPos);
		this.component = Audio;
		this.render();
	}
}

export const AudioNodeViewConstructor: NodeViewConstructor = (...args) =>
	new AudioNodeView(...args);
