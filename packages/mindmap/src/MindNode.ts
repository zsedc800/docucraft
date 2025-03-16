import { IBoundsData, IUI } from 'leafer-ui';
import { IMindNode, NodeChildren } from './interface';
import { ColorItem } from './theme';
import { Slice } from './slice';

export class MindNode implements IBoundsData, IMindNode {
	x: number;
	y: number;
	width: number;
	height: number;
	parentId?: string;
	structureClass?: string;
	children?: NodeChildren<MindNode>;
	theme: { colors?: ColorItem } = {};
	style: { marginBottom?: number; gap?: number } = {};
	switch?: IUI;
	parent?: MindNode;
	size = 1;
	constructor(
		readonly id: string,
		public title: string,
		public UIBox: IUI,
		data: Partial<MindNode> = {}
	) {
		for (const key of Object.keys(data)) this[key] = data[key];
	}

	slice(from: number, to: number) {
		return new Slice([]);
	}
}
