// model.ts 文件命名暂时还是以 mvc 模式命名，方便理解，实际中 命名为 schema.ts 更好
import {
	MarkSpec,
	Node,
	NodeSpec,
	Schema,
	SchemaSpec
} from 'prosemirror-model';
import { codeBlock } from './components/codeBlock';
import { taskItem, taskList } from './components/taskList';
import { tableNodes } from './components/tables';
import { mathNodeSpec } from './components/katex';

function createNodeSpec(config: NodeSpec): NodeSpec {
	config.attrs = { ...config.attrs, hidden: { default: false } };
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

const nodes = {
	// 整个文档
	doc: {
		// 文档内容规定必须是 block 类型的节点（block 与 HTML 中的 block 概念差不多） `+` 号代表可以有一个或多个（规则类似正则）
		content: 'block+'
	},
	// 段落中的文本
	text: {
		// 当前处于 inline 分株，意味着它是个 inline 节点。代表输入的文本
		group: 'inline'
	},

	math: createNodeSpec(mathNodeSpec),

	// 文档段落
	paragraph: createNodeSpec({
		// 段落内容规定必须是 inline 类型的节点（inline 与 HTML 中 inline 概念差不多）, `*` 号代表可以有 0 个或多个（规则类似正则）
		content: 'inline*',
		// 分组：当前节点所在的分组为 block，意味着它是个 block 节点
		group: 'block',
		// 渲染为 html 时候，使用 p 标签渲染，第二个参数 0 念做 “洞”，类似 vue 中 slot 插槽的概念，
		// 证明它有子节点，以后子节点就填充在 p 标签中
		toDOM: () => {
			return ['p', 0];
		},
		// 从别处复制过来的富文本，如果包含 p 标签，将 p 标签序列化为当前的 p 节点后进行展示
		parseDOM: [
			{
				tag: 'p'
			}
		]
	}),
	codeBlock: createNodeSpec(codeBlock),
	blockQuote: createNodeSpec({
		content: 'paragraph block*',
		group: 'block',
		toDOM() {
			return ['blockquote', 0];
		},
		parseDOM: [
			{
				tag: 'blockquote'
			}
		]
	}),

	// 1-6 级标题
	heading: createNodeSpec({
		// attrs 与 vue/react 组件中 props 的概念类似，代表定义当前节点有哪些属性，这里定义了 level 属性，默认值 1
		attrs: {
			level: {
				default: 1
			},
			id: {
				default: null
			},
			fold: {
				default: false
			}
		},
		// 当前节点内容可以是 0 个或多个 inline 节点
		content: 'inline*',
		// 当前节点分组为 block 分组
		group: 'block',
		// defining: 特殊属性，为 true 代表如果在当前标签内（以 h1 为例），全选内容，直接粘贴新的内容后，这些内容还会被 h1 标签包裹
		// 如果为 false, 整个 h1 标签（包括内容与标签本身）将会被替换为其他内容，删除亦如此。
		// 还有其他的特殊属性，后续细说
		defining: true,
		// 转为 html 标签时，根据当前的 level 属性，生成对应的 h1 - h6 标签，节点的内容填充在 h 标签中（“洞”在）。
		toDOM(node) {
			const tag = `h${node.attrs.level}`;
			return [tag, 0];
		},
		// 从别处复制进来的富文本内容，根据标签序列化为当前 heading 节点，并填充对应的 level 属性
		parseDOM: [
			{ tag: 'h1', attrs: { level: 1 } },
			{ tag: 'h2', attrs: { level: 2 } },
			{ tag: 'h3', attrs: { level: 3 } },
			{ tag: 'h4', attrs: { level: 4 } },
			{ tag: 'h5', attrs: { level: 5 } },
			{ tag: 'h6', attrs: { level: 6 } }
		]
	}),
	// listSymbol: {
	// 	group: 'inline',
	// 	inline: true,
	// 	attrs: {
	// 		level: { default: 1 },
	// 		type: { default: 0 }
	// 	},
	// 	toDOM({ attrs }) {
	// 		return [
	// 			'span',
	// 			{
	// 				class: 'list-symbol',
	// 				'data-level': attrs.level,
	// 				'data-type': attrs.type
	// 			}
	// 		];
	// 	},
	// 	parseDOM: [
	// 		{
	// 			tag: 'span[class="list-symbol"]',
	// 			getAttrs(dom) {
	// 				return {
	// 					level: dom.getAttribute('data-level'),
	// 					type: dom.getAttribute('data-type')
	// 				};
	// 			}
	// 		}
	// 	]
	// },
	ordered_list: createNodeSpec({
		content: 'list_item+',
		group: 'block',
		attrs: { order: { default: 1 } },
		parseDOM: [
			{
				tag: 'ol',
				getAttrs(dom) {
					return {
						order: dom.hasAttribute('start')
							? dom.getAttribute?.('start') || ''
							: 1
					};
				}
			}
		],
		toDOM(node) {
			return node.attrs.order == 1
				? ['ol', 0]
				: ['ol', { start: node.attrs.order }, 0];
		}
	}),
	bullet_list: createNodeSpec({
		content: 'list_item+',
		group: 'block',
		parseDOM: [{ tag: 'ul' }],
		toDOM() {
			return ['ul', 0];
		}
	}),
	list_item: createNodeSpec({
		content: 'paragraph block*',
		parseDOM: [{ tag: 'li' }],
		toDOM() {
			return ['li', 0];
		}
	}),
	taskList: createNodeSpec(taskList),
	taskItem: createNodeSpec(taskItem),
	...tableNodes({
		tableGroup: 'block',
		cellContent: 'block+',
		cellAttributes: {}
	}),
	horizontalRule: createNodeSpec({
		group: 'block',
		parseDOM: [{ tag: 'hr' }],
		toDOM: () => ['hr']
	}),
	image: createNodeSpec({
		inline: true,
		attrs: {
			src: {},
			alt: { default: null },
			title: { default: null }
		},
		group: 'inline',
		draggable: true,
		parseDOM: [
			{
				tag: 'img[src]',
				getAttrs: (dom) => ({
					src: dom.getAttribute('src'),
					title: dom.getAttribute('title'),
					alt: dom.getAttribute('alt')
				})
			}
		],
		toDOM: (node) => {
			const { title, src, alt } = node.attrs;

			return ['img', { title, src, alt }];
		}
	}),
	hardBreak: createNodeSpec({
		inline: true,
		group: 'inline',
		selectable: false,
		parseDOM: [{ tag: 'br' }],
		toDOM: () => ['br']
	})
};
export type NodesKey = keyof typeof nodes;
export type MarksKey =
	| 'bold'
	| 'italic'
	| 'link'
	| 'underline'
	| 'linethrough'
	| 'style';

const marks: Record<MarksKey, MarkSpec> = {
	// 文本加粗
	bold: {
		toDOM: () => ['strong', 0],
		parseDOM: [
			{ tag: 'stong' },
			{
				tag: 'b',
				getAttrs: (dom) => dom.style.fontWeight !== 'normal' && null
			},
			{
				style: 'font-weight',
				getAttrs: (val) => /^(bold(er)?|[5-9]\d{2})$/.test(val) && null
			}
		]
	},
	italic: {
		group: 'heading',
		toDOM: () => ['em', 0],
		parseDOM: [
			{ tag: 'em' },
			{
				tag: 'i',
				getAttrs: (dom) => dom.style.fontStyle !== 'normal' && null
			},
			{ style: 'font-style=italic' }
		]
	},
	link: {
		group: 'heading',
		attrs: {
			href: { default: null },
			ref: { default: 'noopener noreferrer nofollow' },
			target: { default: '_blank' },
			title: { default: '' }
		},
		toDOM: (mark) => {
			const { href, ref, target, title } = mark.attrs;
			return ['a', { href, ref, target, title }, 0];
		},
		parseDOM: [{ tag: 'a[href]:not([href *= "javascript:" i])' }]
	},
	underline: {
		parseDOM: [
			{ tag: 'u' },
			{
				style: 'text-decoration',
				getAttrs: (val) => val === 'underline' && null
			}
		],
		toDOM: () => ['u', 0]
	},
	linethrough: {
		parseDOM: [
			{ tag: 's' },
			{ tag: 'strike' },
			{
				style: 'text-decoration',
				getAttrs: (val) => val === 'linethrough' && null
			}
		],
		toDOM: () => ['s', 0]
	},
	style: {
		attrs: {
			color: { default: null },
			fontSize: { default: null },
			backgroundColor: { default: null }
		},
		parseDOM: [
			{ style: 'color', getAttrs: (val) => ({ color: val }) },
			{ style: 'font-size', getAttrs: (val) => ({ fontSize: val }) },
			{
				style: 'background-color',
				getAttrs: (val) => ({ backgroundColor: val })
			}
		],
		toDOM: (mark) => {
			const { color, fontSize, backgroundColor } = mark.attrs;
			let style = '';
			if (color) style += `color:${color}; `;
			if (fontSize) style += `font-size:${fontSize}; `;
			if (backgroundColor) style += `background-color:${backgroundColor}; `;
			return ['span', { style }, 0];
		}
	}
};

const config = {
	nodes,
	marks
};

export const schema = new Schema(config);
