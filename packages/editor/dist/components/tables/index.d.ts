import { Plugin } from 'prosemirror-state';
export { tableNodeTypes, tableNodes } from './schema';
export { TableView } from './tableView';
import './style.css';
export type TableEditingOptions = {
    allowTableNodeSelection?: boolean;
};
export declare function tableEditing({ allowTableNodeSelection, }: TableEditingOptions): Plugin;
