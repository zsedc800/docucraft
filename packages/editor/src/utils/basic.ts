import { NodeSpec, NodeType, Schema, Node } from 'prosemirror-model';

export const getNodeTypesByKeys =
	<K extends string>(keys: readonly K[]) =>
	(nodes: Schema['nodes']): Record<K, NodeType> => {
		return keys.reduce(
			(pre, key) => {
				pre[key] = nodes[key];
				return pre;
			},
			{} as Record<K, Schema['nodes'][K]>
		);
	};

export function createNodeSpec(config: NodeSpec): NodeSpec {
	config.attrs = {
		color: { default: undefined },
		bgColor: { default: undefined },
		...config.attrs,
		hidden: { default: false },
		blockId: { default: null },
		focused: { default: false }
	};
	const toDOM = config.toDOM;
	if (toDOM)
		config.toDOM = (node: Node) => {
			const res = toDOM(node);
			if (Array.isArray(res)) {
				let [tag, attrs, content] = res;
				if (attrs === 0) content = 0;
				const hidden = node.attrs.hidden ? 'hidden' : '';
				attrs = {
					...attrs,
					class: attrs.class ? attrs.class + ' ' + hidden : hidden
				};
				return [tag, attrs, content];
			} else return res;
		};
	return config;
}
