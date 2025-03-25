const mac =
	typeof navigator != 'undefined'
		? /Mac|iP(hone|[oa]d)/.test(navigator.platform)
		: false;

export function normalizeKeyName(name: string) {
	let parts = name.split(/-(?!$)/),
		result = parts[parts.length - 1];
	if (result == 'Space') result = ' ';
	let alt, ctrl, shift, meta;
	for (let i = 0; i < parts.length - 1; i++) {
		let mod = parts[i];
		if (/^(cmd|meta|m)$/i.test(mod)) meta = true;
		else if (/^a(lt)?$/i.test(mod)) alt = true;
		else if (/^(c|ctrl|control)$/i.test(mod)) ctrl = true;
		else if (/^s(hift)?$/i.test(mod)) shift = true;
		else if (/^mod$/i.test(mod)) {
			if (mac) meta = true;
			else ctrl = true;
		} else throw new Error('Unrecognized modifier name: ' + mod);
	}
	if (alt) result = 'Alt-' + result;
	if (ctrl) result = 'Ctrl-' + result;
	if (meta) result = 'Meta-' + result;
	if (shift) result = 'Shift-' + result;
	return result;
}
