import {
	InputRule,
	inputRules,
	textblockTypeInputRule,
	wrappingInputRule
} from 'prosemirror-inputrules';
import { schema } from '../model';
import { outlineTreeKey } from '../components/outline';
import { Fragment } from 'prosemirror-model';

// 定义输入规则
const headingRules = [
	textblockTypeInputRule(/^#\s$/, schema.nodes.heading, { level: 1 }),
	textblockTypeInputRule(/^##\s$/, schema.nodes.heading, { level: 2 }),
	textblockTypeInputRule(/^###\s$/, schema.nodes.heading, { level: 3 }),
	textblockTypeInputRule(/^####\s$/, schema.nodes.heading, { level: 4 }),
	textblockTypeInputRule(/^#####\s$/, schema.nodes.heading, { level: 5 }),
	textblockTypeInputRule(/^######\s$/, schema.nodes.heading, { level: 6 })
];

const listRules = [
	wrappingInputRule(/^\s*([-+*])\s$/, schema.nodes.bullet_list),
	wrappingInputRule(/^(\d+)\.\s$/, schema.nodes.ordered_list, (match) => ({
		order: +match[1]
	})),
	wrappingInputRule(/^\-\[\]\s$/, schema.nodes.taskList)
];
const map: Record<string, string> = {
	javascript: 'javascript',
	typescript: 'typescript',
	rust: 'rust',
	golang: 'golang',
	python: 'python',
	ruby: 'ruby',
	php: 'php',
	html: 'html',
	css: 'css',
	markdown: 'markdown',
	java: 'java',
	'c++': 'c++',
	'c#': 'c#',
	c: 'c',
	js: 'javascript',
	ts: 'typescript',
	py: 'python',
	go: 'golang',
	rs: 'rust',
	plaintext: 'plaintext'
};
const mapTolang = (lang: string) => {
	return map[lang] || 'plaintext';
};

const rules = [
	...headingRules,
	...listRules,
	textblockTypeInputRule(
		/^```([\w+#]*)\s$/,
		schema.nodes.codeBlock,
		(match) => ({ language: mapTolang(match[1]) })
	),
	wrappingInputRule(/^(>|》)\s$/, schema.nodes.blockQuote),
	new InputRule(/(\d+|i)\.\s$/, (state, match, start, end) => {
		let tr = state.tr;
		const $start = state.doc.resolve(start);
		const parent = $start.parent;

		if (parent.type !== schema.nodes.heading) return null;
		const level = parent.attrs.level;
		const outlineTree = outlineTreeKey.getState(state);
		const [_, key] = match;
		const orderType = key === 'i' ? 3 : 1;

		if (outlineTree) {
			tr.delete(start, end);
			setTimeout(() => {
				outlineTree.setOrderType(orderType);
			}, 17);
		}
		return tr;
	})
];

export const buildInputRules = () => inputRules({ rules });
