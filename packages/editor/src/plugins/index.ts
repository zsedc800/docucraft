import { keymap } from 'prosemirror-keymap';
import { history } from 'prosemirror-history';
import { buildInputRules } from '../commands/inputRules';
import { getMyKeyMap } from '../commands/keymap';
import { tableEditing } from '../components/tables';
import { outlineTreePlugin } from '../components/outline';
import checkSelection from './selection';
import { handleImagePaste } from '../components/image';
export default [
	buildInputRules(),
	keymap(getMyKeyMap()),
	history(),
	tableEditing({}),
	outlineTreePlugin,
	checkSelection(),
	handleImagePaste()
];
