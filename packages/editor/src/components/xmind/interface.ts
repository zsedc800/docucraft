export interface NodeChildren<T> {
	visible?: boolean;
	attached: T[];
}
export interface IMindNode {
	id: string;
	parentId: string;
	title: string;
	structureClass: string;
	children?: NodeChildren<IMindNode>;
}

export interface IMindRoot {
	title: string;
	rootTopic: IMindNode;
	theme: string;
}

export interface IRect {
	x: number;
	y: number;
	width: number;
	height: number;
}
