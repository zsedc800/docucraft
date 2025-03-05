export interface MindNode {
	id: string;
	parentId: string;
	title: string;
	structureClass: string;
	children: {
		attached: MindNode[];
	};
}

export interface MindRoot {
	title: string;
	topics: MindNode[];
	theme: string;
}
