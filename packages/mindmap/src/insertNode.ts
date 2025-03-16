import { Box, Ellipse, Text, PointerEvent } from 'leafer-ui';
import { MindNode } from './MindNode';
import { generateUniqueId, SWRadius } from './utils';
import { baseColors, ColorItem } from './theme';
import { MindMap } from './mindMap';

let i = 0;

function getBaseColor() {
	const { length } = baseColors;
	return baseColors[i++ % length];
}

const cornerRadius = 5;

export default function insertNode(
	{ title, ...rest },
	parent: MindNode,
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
		p = p.parent;
	}
	const UIBox = new Box({
		cornerRadius,
		editable: true,
		fill: colors.bgColor,
		children: [
			{
				cornerRadius,
				tag: 'Text',
				padding: depth < 2 ? [6, 12] : [4, 8],
				text: title,

				fontSize: depth > 0 ? (depth === 1 ? 16 : 12) : 20,
				fill: colors ? colors.color : 'black',
				textAlign: 'left',
				verticalAlign: 'top',
				editable: true
			}
		]
	});

	// if (!colors) {
	// 	UIBox.on(DragEvent.DRAG, ({ moveX, moveY }: DragEvent) => {
	// 		UIBox.parent.move(moveX, moveY);
	// 	});
	// }

	const { width, height } = UIBox.boxBounds;
	const mindNode = new MindNode(generateUniqueId(), title, UIBox, {
		...rest,
		x: 0,
		y: 0,
		width,
		height,
		UIBox,
		children: {
			attached: []
		},
		theme: { colors: parent ? colors : void 0 }
	});

	if (depth > 1 && !parent.switch) {
		const w = SWRadius * 2;
		const text = Text.one({
			fill: colors.bgColor,
			fontSize: 8,
			x: 0,
			y: 0
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
				text.set({ text: '10' });
			}
			mindMap.render();
		});
		parent.switch = sw;
	}

	UIBox.data.node = mindNode;
	mindNode.parent = parent;
	return mindNode;
}
