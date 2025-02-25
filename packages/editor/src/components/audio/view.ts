import { NodeViewConstructor } from 'prosemirror-view';
import { BaseNodeView } from '../../utils/view';
import Audio from './Audio';
import { NodeViewParameters } from '../../interface';

export class AudioNodeView extends BaseNodeView {
	constructor(...[node, view, getPos]: NodeViewParameters) {
		super(node, view, getPos);
		this.component = Audio;
		this.render();
	}
}

export const AudioNodeViewConstructor: NodeViewConstructor = (
	...args: NodeViewParameters
) => new AudioNodeView(...args);
