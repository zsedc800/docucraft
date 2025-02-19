import { CSSProperties, ReactNode } from '@docucraft/srender';
import { Command } from 'prosemirror-state';
import { BaseNodeView } from '../../utils/view';

export interface ToolItem {
	title: string;
	icon: (p: any) => ReactNode;
	handler: Command | ((nodeView: BaseNodeView) => void);
	style?: CSSProperties;
}

export interface BlockItem {
	title: string;
	name: string;
	cover: string | ((props: any) => ReactNode);
	description: string;
	handler: Command;
	type?: 'block' | 'inline' | 'pop';
}
