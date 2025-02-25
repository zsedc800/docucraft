import { ViewMutationRecord } from 'prosemirror-view';
import { Node, NodeType, Schema } from 'prosemirror-model';
import { BaseNodeView } from '../../utils/view';
import { shallowEqual } from '../../utils/base';
import Paragraph from './Paragraph';
import { getSchemaNodes } from '../../model';
import { NodeViewConstructor, NodeViewParameters } from '../../interface';

function getTextByNodeType(type: NodeType, schema: Schema) {
	const nodeTypes = getSchemaNodes(schema);

	if (type === nodeTypes.list_item) {
		return '项目';
	} else if (type === nodeTypes.taskItem) {
		return '代办事项';
	} else if (type === nodeTypes.timelineContent) {
		return '输入 / 唤起命令';
	} else if (type && type !== nodeTypes.doc) {
		return '';
	}
	return '输入 / 唤起命令';
}

export class ParagraphView extends BaseNodeView {
	placeholder: string = ' ';
	constructor(...args: NodeViewParameters) {
		const [node, view, getPos] = args;
		super(node, view, getPos);
		this.component = Paragraph;
		this.render({ text: node.textContent });
	}

	update(node: Node) {
		const { type, attrs, textContent: txt } = node;
		const { attrs: props, type: t, textContent: text } = this.node;
		if (type !== t || attrs.blockId !== props.blockId) return false;
		this.node = node;
		if (!shallowEqual(attrs, props) || txt !== text) this.render({ text: txt });
		return true;
	}

	ignoreMutation(mutation: ViewMutationRecord): boolean {
		if (super.ignoreMutation(mutation)) return true;
		return mutation.type === 'attributes';
	}
	onFocusIn(): void {
		const parent = this.getResolvedPos()?.parent;
		if (!parent) return;
		const placeholder = getTextByNodeType(parent.type, this.view.state.schema);
		this.setNodeAttribute('placeholder', placeholder);
	}
	onFocusOut(e: { reason: 'change' | 'blur'; event?: Event }): void {
		this.setNodeAttribute('placeholder', '');
	}
}

export const ParagraphViewConstructor: NodeViewConstructor = (...args) =>
	new ParagraphView(...args);
