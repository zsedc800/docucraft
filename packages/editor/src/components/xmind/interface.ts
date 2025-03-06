export interface IMindNode {
	id: string;
	parentId: string;
	title: string;
	structureClass: string;
	children: {
		attached: IMindNode[];
	};
}

export interface IMindRoot {
	title: string;
	topics: IMindNode[];
	theme: string;
}
