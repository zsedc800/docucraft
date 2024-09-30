import { Node } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';

let view: { current?: EditorView } = {};
export const addView = (v: EditorView) => (view.current = v);
export const getView = () => view.current;
export default () => '';

export function escapeLatex(latex: string) {
	const escapeMap: Record<string, string> = {
		'\\': '\\\\',
		'{': '\\{',
		'}': '\\}',
		$: '\\$',
		'&': '\\&',
		'#': '\\#',
		_: '\\_',
		'%': '\\%',
		'^': '\\^',
		'~': '\\~'
	};

	return latex.replace(/[\\{}$&#_%^~]/g, (match) => escapeMap[match]);
}

let uniqueIdCounter = 1000;
export function generateUniqueId() {
	uniqueIdCounter++;
	const base36 = uniqueIdCounter.toString(36);
	const randomPart = Math.random().toString(36).substring(2, 4);
	return randomPart + base36;
}

export function assignUniqueId(node: any) {
	if (!node.attrs.id) {
		node.attrs.id = generateUniqueId();
	}
}

export function convertToChineseNumber(num: number): string {
	const units = [
		'',
		'十',
		'百',
		'千',
		'万',
		'十',
		'百',
		'千',
		'亿',
		'十',
		'百',
		'千',
		'万'
	];
	const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

	if (num === 0) return '零';

	const numStr = num.toString();
	let result = '';
	let zeroFlag = false;

	for (let i = 0; i < numStr.length; i++) {
		const digit = parseInt(numStr[i]);
		const unitPos = numStr.length - i - 1;

		if (digit === 0) {
			zeroFlag = true;
		} else {
			if (zeroFlag) {
				result += '零';
				zeroFlag = false;
			}
			result += digits[digit] + units[unitPos];
		}
	}
	result = result.replace(/^一十/, '十');
	return result.replace(/零+$/, '');
}

export function convertToAlphabet(num: number): string {
	if (num <= 0) return '';

	let result = '';
	while (num > 0) {
		num--;
		result = String.fromCharCode((num % 26) + 97) + result;
		num = Math.floor(num / 26);
	}

	return result;
}

export function convertToRoman(num: number): string {
	const romanNumerals: { [key: number]: string } = {
		1000: 'm',
		900: 'cm',
		500: 'd',
		400: 'cd',
		100: 'c',
		90: 'xc',
		50: 'l',
		40: 'xl',
		10: 'x',
		9: 'ix',
		5: 'v',
		4: 'iv',
		1: 'i'
	};

	let result = '';
	for (const [value, numeral] of Object.entries(romanNumerals).reverse()) {
		while (num >= parseInt(value)) {
			result += numeral;
			num -= parseInt(value);
		}
	}

	return result;
}
