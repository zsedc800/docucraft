import {
	InputRule,
	inputRules,
	textblockTypeInputRule as textBR,
	wrappingInputRule as wrappingIR
} from 'prosemirror-inputrules';
import { schema } from '../model';
import { outlineTreeKey } from '../components/outline';
import { languages } from '@codemirror/language-data';
import { generateUniqueId, nextTick } from '../utils';
import { Attrs, NodeType, Node } from 'prosemirror-model';

function getAttributes(
	getAttrs?: Attrs | null | ((matches: RegExpMatchArray) => Attrs | null)
) {
	return typeof getAttrs === 'function'
		? (matches: RegExpMatchArray) => ({
				...getAttrs(matches),
				blockId: generateUniqueId()
			})
		: { ...getAttrs, blockId: generateUniqueId() };
}

function wrappingInputRule(
	regexp: RegExp,
	nodeType: NodeType,
	getAttrs?: Attrs | null | ((matches: RegExpMatchArray) => Attrs | null),
	joinPredicate?: (match: RegExpMatchArray, node: Node) => boolean
) {
	return wrappingIR(regexp, nodeType, getAttributes(getAttrs), joinPredicate);
}

function textblockTypeInputRule(
	regexp: RegExp,
	nodeType: NodeType,
	getAttrs?: Attrs | null | ((match: RegExpMatchArray) => Attrs | null)
) {
	return textBR(regexp, nodeType, getAttributes(getAttrs));
}

const mapTolang = (lang: string) => {
	return (
		languages
			.find(({ extensions }) => extensions.includes(lang))
			?.name.toLowerCase() || 'plaintext'
	);
};

export const buildInputRules = () => {
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

	const rules = [
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
				nextTick(() => outlineTree.setOrderType(orderType));
			}
			return tr;
		}),
		...headingRules,
		...listRules,
		textblockTypeInputRule(
			/^```([\w+#]*)\s$/,
			schema.nodes.codeBlock,
			(match) => ({ language: mapTolang(match[1]) })
		),
		wrappingInputRule(/^(>|》)\s$/, schema.nodes.blockQuote)
	];
	return inputRules({ rules });
};
