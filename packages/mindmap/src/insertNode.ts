import { Box, Ellipse, Text, PointerEvent } from 'leafer-ui';
import { MindNode } from './MindNode';
import {
	generateUniqueId,
	HORIZONTAL_GAP,
	SWRadius,
	VERTICAL_GAP
} from './utils';
import { baseColors, ColorItem } from './theme';
import { MindMap } from './mindMap';
import { IMindNode } from './interface';

let i = 0;

function getBaseColor() {
	const { length } = baseColors;
	return baseColors[i++ % length];
}

const cornerRadius = 5;

export default function insertNode(
	{ title, id, ...rest }: Partial<IMindNode>,
	parent: MindNode | undefined,
	mindMap: MindMap
) {
	const { theme: { colors: c } = {} } = parent || {};
	const colors =
		c ||
		(parent
			? getBaseColor()
			: ({ bgColor: '#455A64', color: '#FFFFFF' } as ColorItem));
	let depth = 0,
		p = parent;

	while (p) {
		depth++;
		p.size++;
		p = p.parent;
	}

	title = title || (depth > 1 ? '子主题' : '分支主题');
	const text = Text.one({
		cornerRadius,
		padding: depth < 2 ? [6, 12] : [4, 8],
		text: title,
		fontSize: depth > 0 ? (depth === 1 ? 16 : 12) : 20,
		fill: colors ? colors.color : 'black',
		textAlign: 'left',
		verticalAlign: 'top',
		editable: true
	});
	const UIBox = new Box({
		cornerRadius,
		editable: true,
		fill: colors.bgColor,
		children: [text]
	});

	const { width, height } = UIBox.boxBounds;
	const mindNode = new MindNode(id || generateUniqueId(), title, UIBox, {
		...rest,
		x: 0,
		y: 0,
		width,
		height,
		parentId: parent?.id,
		UIBox,
		UI: {
			text
		},
		children: {
			attached: []
		},
		theme: { colors: parent ? colors : void 0 },
		style: {
			gap: depth > 0 ? HORIZONTAL_GAP : 60,
			marginBottom: depth > 0 ? VERTICAL_GAP : 40
		}
	});

	if (depth > 1 && !parent.switch) {
		const w = SWRadius * 2;
		const text = Text.one({
			fill: colors.bgColor,
			fontSize: 8,
			// letterSpacing: -1,
			width: w,
			height: w,
			textAlign: 'center',
			verticalAlign: 'middle'
		});

		const sw = Box.one({
			children: [
				Ellipse.one({ width: w, height: w, fill: 'white' }),
				Ellipse.one({
					width: w,
					height: w,
					fill: colors.bgColor,
					innerRadius: 0.9
				}),
				text
			],
			zIndex: 2,
			opacity: 0,
			cursor: 'pointer'
		});
		sw.on(
			PointerEvent.ENTER,
			() => parent.children.visible !== false && (sw.opacity = 1)
		);
		sw.on(
			PointerEvent.LEAVE,
			() => parent.children.visible !== false && (sw.opacity = 0)
		);
		sw.on(PointerEvent.BEFORE_DOWN, () => {
			if (parent.children.visible === false) {
				parent.children.visible = true;
				text.set({ text: '' });
			} else {
				parent.children.visible = false;
				const size = parent.size - 1;
				size > 99
					? text.set({
							text: '...',
							y: -2
						})
					: text.set({ text: size });
			}

			mindMap.render();
		});
		parent.switch = sw;
	}

	UIBox.data.node = mindNode;
	mindNode.parent = parent;
	// mindNode.initYNode();
	return mindNode;
}
