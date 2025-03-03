import { CSSProperties, ReactNode } from '@docucraft/srender';
import { Command, EditorState } from 'prosemirror-state';
import { BaseNodeView } from '../../utils/view';
import { NodesKey } from '../../model';
import { EditorView } from 'prosemirror-view';

export interface BlockItem {
	title: string;
	name: string;
	icon?: (p: any) => ReactNode;
	cover?: string | ((props: any) => ReactNode);
	description?: string;
	handler:
		| ((
				state: EditorState,
				dispatch?: EditorView['dispatch'],
				view?: EditorView
		  ) => void)
		| ((nodeView: BaseNodeView) => void);
	style?: CSSProperties;
	blockType: NodesKey;
	// handler: Command;
	type?: 'block' | 'inline' | 'pop';
}
