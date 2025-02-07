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

export function onBeforeInput(event: InputEvent) {
	const { target, inputType } = event;

	if (
		!ALLOW_INPUT_TYPE.includes(inputType) ||
		inputType === 'insertFromPaste'
	) {
		event.preventDefault();
		return;
	}
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
	return findRichTextarea(node);
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
