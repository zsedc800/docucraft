import { NodeSpec } from 'prosemirror-model';
import { ImageItem } from '../../interface';

export const imageGalleryNodeSpec: NodeSpec = {
	inline: false,
	attrs: {
		images: { default: [] },
		layout: { default: 'quilted' },
		cols: { default: null },
		rowHeight: { default: null },
		gap: { default: null }
	},
	atom: true,
	group: 'block',
	draggable: false,
	parseDOM: [
		{
			tag: 'div.image-gallery',
			getAttrs: (dom) => {
				const imglist = dom.querySelectorAll('img');
				const images: ImageItem[] = [];
				for (const img of imglist.values())
					if (img.src) images.push({ src: img.src });
				return {
					images
				};
			}
		}
	],
	toDOM: (node) => {
		return ['div', { class: 'image-gallery' }];
	}
};
