import { isMac } from '../../utils';
import { HistoryStack } from './history';
const ALLOW_INPUT_TYPE = [
	// 输入类型
	'insertParagraph', // 输入新行 (直接按下 回车)
	'insertLineBreak', // 输入换行符 (按下 shift + 回车)
	'insertText', // 输入文本
	'insertCompositionText', // 中文合成输入
	'insertFromPaste', // 粘贴输入
	'insertFromDrop', // 从别的地方拖拽输入，在 firefox 中尝试
	// 删除类型
	'deleteContentBackward', // 向前删除，即直接按下删除键
	'deleteContentForward', // 向后删除，win 按下 delete 键，mac 按下 fn + delete
	'deleteByCut', // 剪切，通过 ctrl + x 或 cmd + x 剪切
	'deleteByDrag', // 从当前输入框中拖拽到其他地方
	// 历史
	'historyUndo', // ctrl + z 或 cmd + z
	'historyRedo' // ctrl + shift + z 或 cmd + shift + z
];

export const onBeforeInput = (history: HistoryStack) => (event: InputEvent) => {
	const { currentTarget, inputType } = event;

	if (!ALLOW_INPUT_TYPE.includes(inputType)) {
		event.preventDefault();
		return;
	}

	switch (inputType) {
		case 'insertFromPaste':
		case 'insertParagraph':
		case 'insertLineBreak':
			event.preventDefault();
			insertBr();
			break;
		case 'historyUndo':
			event.preventDefault();
			undoHistory(history, currentTarget as HTMLElement);
			dispatchInnerInputEvent(event, inputType);
			break;
		case 'historyRedo':
			event.preventDefault();
			redoHistory(history, currentTarget as HTMLElement);
			dispatchInnerInputEvent(event, inputType);
			break;
	}
	console.log(inputType, 'inputType');
};

export const onInput = (history: HistoryStack) => (event: InputEvent) => {
	const { inputType, target, isComposing } = event;

	if (!['historyUndo', 'historyRedo'].includes(inputType) && !isComposing) {
		history.push({
			content: (target as HTMLElement).innerText,
			pos: getCursorPosition()
		});
	}
};

export const onFocus = (history: HistoryStack) => (event: FocusEvent) => {
	const node = event.currentTarget as HTMLElement;
	requestAnimationFrame(() => {
		if (!history.size) {
			history.push({ content: node.innerText, pos: getCursorPosition() });
		}
	});
};

export const compositionEnd =
	(history: HistoryStack) => (event: InputEvent) => {
		history.push({
			content: (event.target as HTMLElement).innerText,
			pos: getCursorPosition()
		});
	};

function insertBr() {
	const selection = window.getSelection();
	if (!selection || !selection.rangeCount) return false;
	const { anchorNode, anchorOffset } = selection;
	const textareaNode = findRichTextarea(anchorNode);
	const isText = isTextNode(anchorNode);
	const { nextSibling } = anchorNode || {};

	if (
		(isText &&
			anchorNode.length === anchorOffset &&
			(!nextSibling || (isTextNode(nextSibling) && !nextSibling.nodeValue))) ||
		(!isText && !textareaNode.textContent)
	)
		insertNode('br');

	insertNode('br');

	return true;
}

export function onPaste(event: ClipboardEvent) {
	event.preventDefault();
	const pasteText = event.clipboardData?.getData('text  ') || '';
	if (pasteText) {
		event.target?.dispatchEvent(
			new InputEvent('beforeinput', {
				inputType: 'insertFromPaste',
				data: pasteText,
				bubbles: true,
				cancelable: true
			})
		);
	}
}

export function insertNode(node: Node | keyof HTMLElementTagNameMap) {
	const selection = window.getSelection();
	if (!selection || !selection.rangeCount) return false;

	if (!selection.isCollapsed) selection.deleteFromDocument();

	if (typeof node === 'string') node = document.createElement(node);

	const range = selection.getRangeAt(0).cloneRange();
	selection.removeAllRanges();
	range.insertNode(node);
	range.collapse();
	// range.setStartAfter(node);
	// range.setEndAfter(node);
	selection.addRange(range);
	return true;
}

export function insertContent(content: string) {
	const selection = window.getSelection();
	if (!selection || !selection.rangeCount) return false;

	if (!selection.isCollapsed) selection.deleteFromDocument();

	const range = selection.getRangeAt(0).cloneRange();
	selection.removeAllRanges();
	const textNode = document.createTextNode(content);
	range.insertNode(textNode);
	range.collapse();
	selection.addRange(range);
	return true;
}

export function isTextNode(node: unknown): node is Text {
	return !!node && node instanceof Text;
}

export function isBrNode(node: unknown): node is HTMLBRElement {
	return !!node && node instanceof HTMLBRElement;
}

export function isRichTextarea(node: unknown): node is HTMLElement {
	return !!(node instanceof HTMLElement && node.dataset.richTextarea);
}

export function findRichTextarea(node: Node | null) {
	if (!node) return null;
	if (isRichTextarea(node)) return node;
	return findRichTextarea(node.parentNode);
}

export function getCursorPosition() {
	const selection = window.getSelection();
	if (!selection || !selection.rangeCount || !selection.isCollapsed) return 0;

	const { anchorNode, anchorOffset } = selection;
	const textareaNode = findRichTextarea(anchorNode);

	if (!textareaNode) return 0;

	const { childNodes } = textareaNode;

	if (isTextNode(anchorNode)) {
		let pos = 0;
		for (const child of childNodes) {
			if (child === anchorNode) {
				pos += anchorOffset;
				return pos;
			}
			pos += isTextNode(child) ? child.length : 1;
		}
	}

	if (isRichTextarea(anchorNode)) {
		let pos = 0;
		for (let i = 0; i < anchorOffset; i++) {
			const child = childNodes[i];
			if (isTextNode(child)) pos += child.length;
			else pos++;
		}
		return pos;
	}

	return 0;
}

function moveCursorTo(node: Node, pos: number) {
	const selection = window.getSelection();
	if (!selection) return;
	const { childNodes } = node;

	const range = document.createRange();
	let i = 0;
	for (const child of childNodes) {
		if (isTextNode(child)) {
			if (i + child.length >= pos) {
				const offset = pos - i;
				range.setStart(child, offset);
				range.setEnd(child, offset);
				break;
			}
			i += child.length;
		} else if (isBrNode(child)) {
			if (i + 1 === pos) {
				range.setStartAfter(child);
				range.setEndAfter(child);
				break;
			}
			i++;
		}
	}
	if (selection.rangeCount) selection.removeAllRanges();

	selection.addRange(range);
}

export function undoHistory(stack: HistoryStack, textAreaNode: HTMLElement) {
	const item = stack.undo();

	if (!item) return false;

	textAreaNode.innerText = item.content;
	moveCursorTo(textAreaNode, item.pos);
	return true;
}

export function redoHistory(stack: HistoryStack, textAreaNode: HTMLElement) {
	const item = stack.redo();
	if (!item) return false;
	textAreaNode.innerText = item.content;
	moveCursorTo(textAreaNode, item.pos);
	return true;
}

function dispatchInnerInputEvent(
	event: InputEvent,
	inputType: string,
	data: string | null = null
) {
	requestAnimationFrame(() => {
		event.target.dispatchEvent(
			new InputEvent('input', {
				inputType,
				bubbles: event.bubbles,
				cancelable: event.cancelable,
				data
			})
		);
	});
}

export function onKeyDown(event: KeyboardEvent) {
	const ctrlKey = isMac ? event.metaKey : event.ctrlKey;
	if (event.code === 'keyZ' && ctrlKey && !event.shiftKey) {
		event.preventDefault();
		const textareaNode = event.currentTarget as HTMLElement;
		textareaNode.dispatchEvent(
			new InputEvent('beforeinput', { data: null, inputType: 'historyUndo' })
		);
		return;
	}

	if (event.code === 'keyZ' && ctrlKey && event.shiftKey) {
		event.preventDefault();
		const textareaNode = event.currentTarget as HTMLElement;
		textareaNode.dispatchEvent(
			new InputEvent('beforeinput', { data: null, inputType: 'historyRedo' })
		);
		return;
	}
}
