import { Plugin } from 'prosemirror-state';
export { tableNodeTypes, tableNodes } from './schema';
export { TableView } from './tableView';
import './style.scss';
export type TableEditingOptions = {
    allowTableNodeSelection?: boolean;
};
export declare function tableEditing({ allowTableNodeSelection }: TableEditingOptions): Plugin;
