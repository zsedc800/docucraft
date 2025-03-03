import {
	forwardRef,
	useEffect,
	useRef,
	ForwardedRef,
	CSSProperties
} from '@docucraft/srender';
import Button from '@mui/material/Button';
import SvgKBReturn from '@docucraft/icons/svg/KeyboardReturn';
import { RichTextArea, RichTextAreaRef } from '../../kits/Input';
import { BaseProps } from '../../interface';

interface InputProps {
	onChange?: (e: string) => void;
	onFinish?: (e: string) => void;
	value?: string;
	errorMsg?: string;
	placeholder?: string;
	inputStyle?: CSSProperties;
}

interface TexInputRef {}

function TexInputBox(
	{
		onChange,
		onFinish,
		value,
		errorMsg,
		placeholder,
		inputStyle,
		...props
	}: BaseProps<InputProps>,
	ref: ForwardedRef<TexInputRef>
) {
	const ctx = useRef<RichTextAreaRef>({} as RichTextAreaRef);
	useEffect(() => {
		ctx.current.selectAll();
	}, []);
	return (
		<div className="tex-input" {...props}>
			<div className="tex-input-box">
				<RichTextArea
					ref={ctx}
					value={value}
					className="input"
					onChange={onChange}
					placeholder={placeholder}
					style={inputStyle}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							onFinish && onFinish(ctx.current.value());
						}
					}}
				/>
				<div className="tex-input-extra">
					<Button
						onClick={() => {
							onFinish && onFinish(ctx.current.value() || '');
						}}
						variant="contained"
						size="small"
						disabled={!!errorMsg}
					>
						完成
						<SvgKBReturn style={{ fontSize: '1.25em' }} />
					</Button>
				</div>
			</div>

			{errorMsg && (
				<div className="error ellipsis">
					<span style={{ fontSize: 14 }}>无效的公式：</span>
					{errorMsg}
				</div>
			)}
		</div>
	);
}

export default forwardRef(TexInputBox);
