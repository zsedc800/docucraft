import { IKeyEvent } from 'leafer-ui';
import { normalizeKeyName } from './utils/keymap';
import { keyName } from './utils/w3c-keyname';

export interface InputKeyMap {
	[k: string]: (e: IKeyEvent) => void;
}

function normalize(map: InputKeyMap) {
	const copy: InputKeyMap = Object.create(null);
	for (const prop in map) copy[normalizeKeyName(prop)] = map[prop];
	return copy;
}

function modifiers(name: string, event: IKeyEvent, shift = true) {
	if (event.altKey) name = 'Alt-' + name;
	if (event.ctrlKey) name = 'Ctrl-' + name;
	if (event.metaKey) name = 'Meta-' + name;
	if (shift && event.shiftKey) name = 'Shift-' + name;
	return name;
}

export function keymap(bindings: InputKeyMap) {
	const map = normalize(bindings);
	return (e: IKeyEvent) => {
		const name = keyName(e),
			direct = map[modifiers(name, e)];
		direct && direct(e);
	};
}
