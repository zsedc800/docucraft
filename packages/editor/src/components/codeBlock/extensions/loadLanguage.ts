import { languages as langs } from '@codemirror/language-data';
import { Compartment } from '@codemirror/state';
import { EditorView } from 'codemirror';
export const languageCompartment = new Compartment();

let useSelfHosted = false;

async function loadOfficialLanguage(name: string) {
	const languageSupport = langs.find(
		(lang) => lang.name.toLowerCase() === name
	);

	if (languageSupport) {
		const mod = await languageSupport.load();

		return mod;
	}
}

export default async function loadLanguage(name: string) {
	try {
		return await loadOfficialLanguage(name);
	} catch (e) {}
}

export async function setLanguage(name: string, view: EditorView) {
	let lang;
	if (name !== 'plaintext') lang = await loadLanguage(name);

	view.dispatch({ effects: languageCompartment.reconfigure(lang || []) });
}

export async function detectLanguageFromCode(code: string) {
	// const hljs = (await import('highlight.js')).default;
	// const res = hljs.highlightAuto(code);

	// return res.language || 'plaintext';
	return 'plaintext';
}
