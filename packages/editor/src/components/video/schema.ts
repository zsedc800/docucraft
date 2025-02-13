import { NodeSpec } from 'prosemirror-model';

export const videoNodeSpec: NodeSpec = {
	group: 'block',
	draggable: true,
	atom: true,
	attrs: {
		src: { default: '' },
		type: { default: 'custom' }, // 类型: "embed" | "custom"
		poster: { default: '' }
	},
	parseDOM: [
		{
			tag: 'iframe',
			getAttrs(dom) {
				const src = dom.getAttribute('src') ?? '';
				if (src.includes('youtube.com') || src.includes('youtu.be')) {
					return { src, type: 'embed' };
				} else if (src.includes('bilibili.com')) {
					return { src, type: 'embed' };
				}
				return { src, type: 'custom' };
			}
		},
		{
			tag: 'video',
			getAttrs(dom) {
				return {
					src: dom.getAttribute('src'),
					type: 'custom',
					poster: dom.getAttribute('poster') || ''
				};
			}
		}
	],
	toDOM(node) {
		const { src, type, poster } = node.attrs;
		if (type === 'embed') {
			return ['iframe', { src, frameborder: 0, allowfullscreen: 'true' }];
		}
		return ['video', { src, controls: 'true', poster }];
	}
};
