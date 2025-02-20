import { Attrs, NodeType } from 'prosemirror-model';
import { generateUniqueId } from './utils/base';

function addBlockId(attrs?: Attrs | null) {
	if (attrs?.blockId) return attrs;
	return { ...attrs, blockId: generateUniqueId() };
}
const proto = NodeType.prototype;

const { createAndFill, create, createChecked } = proto;

proto.createAndFill = function (attrs, content, marks) {
	return createAndFill.call(this, addBlockId(attrs), content, marks);
};

proto.create = function (attrs, content, marks) {
	return create.call(this, addBlockId(attrs), content, marks);
};

proto.createChecked = function (attrs, content, marks) {
	return createChecked.call(this, addBlockId(attrs), content, marks);
};

// const tProto = Transform.prototype;
// const { split } = tProto;
// tProto.split = function (pos, depth, typesAfter) {
//   return split.call(this, pos, depth, typesAfter);
// }
