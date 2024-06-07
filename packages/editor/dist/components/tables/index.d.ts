import { Plugin } from 'prosemirror-state';
export { tableNodeTypes, tableNodes } from './schema';
export { TableView } from './tableView';
export { columnResizing } from './columnresizing';
import './style.scss';
export type TableEditingOptions = {
    allowTableNodeSelection?: boolean;
};
export declare function tableEditing({ allowTableNodeSelection }: TableEditingOptions): Plugin;
