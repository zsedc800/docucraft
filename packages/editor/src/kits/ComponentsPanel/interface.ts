import { CSSProperties, ReactNode } from '@docucraft/srender';
import { Command } from 'prosemirror-state';
import { BaseNodeView } from '../../utils/view';

export interface BlockItem {
	title: string;
	name: string;
	icon?: (p: any) => ReactNode;
	cover?: string | ((props: any) => ReactNode);
	description?: string;
	handler: Command | ((nodeView: BaseNodeView) => void);
	style?: CSSProperties;
	// handler: Command;
	type?: 'block' | 'inline' | 'pop';
}
