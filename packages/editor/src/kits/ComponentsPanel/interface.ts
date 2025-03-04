import { CSSProperties, ReactNode } from '@docucraft/srender';
import { Command, EditorState } from 'prosemirror-state';
import { BaseNodeView } from '../../utils/view';
import { NodesKey } from '../../model';
type Heading = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export interface BlockItem {
	title: string;
	name: Omit<NodesKey | Heading, 'heading'>;
	icon?: (p: any) => ReactNode;
	cover?: string | ((props: any) => ReactNode);
	description?: string;
	handler: Command | ((nodeView: BaseNodeView) => void);
	style?: CSSProperties;
	blockType: NodesKey;
	// handler: Command;
	type?: 'block' | 'inline' | 'pop';
}
