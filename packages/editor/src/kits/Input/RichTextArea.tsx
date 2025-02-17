import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef
} from '@docucraft/srender';
import {
	onPaste,
	onBeforeInput,
	onInput as toInput,
	onFocus as toFocus,
	compositionEnd
} from './utils';
import { HistoryStack } from './history';
import { classnames } from '../../utils';
import { BaseProps } from '../../interface';
import Box from '../Box';
import './style.scss';

type Props = BaseProps<{
	value?: string;
	onChange?: (e: string) => void;
	component?: keyof HTMLElementTagNameMap;
}>;

export interface RichTextAreaRef {
	clear(): void;
	value(v?: string): string | undefined;
	selectAll(): void;
}

export default forwardRef<RichTextAreaRef, Props>(
	({ value, onChange, component = 'div', className, ...attrs }, ref) => {
		const history = useRef(new HistoryStack());
		const textarea = useRef<HTMLElement>(null);
		const beforeInput = useMemo(() => onBeforeInput(history.current), []);
		const onInput = useMemo(() => toInput(history.current), []);
		const onFocus = useMemo(() => toFocus(history.current), []);
		const onCompositionEnd = useMemo(() => compositionEnd(history.current), []);
		const updateValue = (val) => {
			textarea.current.innerText = val;
			textarea.current.dispatchEvent(
				new InputEvent('input', {
					inputType: 'insertText',
					data: val
				})
			);
		};
		useEffect(() => {
			if (value !== textarea.current.innerText) updateValue(value || '');
		}, [value]);

		useImperativeHandle(ref, () => ({
			clear() {
				updateValue('');
			},
			value(v) {
				if (typeof v !== 'undefined') updateValue(v);
				return textarea.current.innerText;
			},
			selectAll() {
				const range = document.createRange();
				range.selectNodeContents(textarea.current);
				const selection = window.getSelection();
				if (!selection) return;
				if (selection.rangeCount) selection.removeAllRanges();
				selection.addRange(range);
			}
		}));

		return (
			<Box
				ref={textarea}
				component={component}
				data-rich-textarea
				className={classnames('rich-textarea', className)}
				onPaste={(e) => onPaste(e.nativeEvent)}
				onBeforeInput={beforeInput as any}
				onInput={(e) => {
					onInput(e.nativeEvent as InputEvent);
					onChange && onChange(e.currentTarget.innerText.trim());
				}}
				onFocus={onFocus as any}
				onCompositionEnd={onCompositionEnd as any}
				contentEditable
				{...attrs}
			/>
		);
	}
);
