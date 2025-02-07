import katex from 'katex';
import {
	HTMLAttributes,
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState
} from '@docucraft/srender';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SvgKBReturn from '@docucraft/icons/svg/KeyboardReturn';
import Icon from '@docucraft/icons';
import { BaseNodeView, useNodeView } from '../../utils/view';
import Tools from '../toolBar/Tools';
import Menu from '../../kits/Menu';
import { classnames } from '../../utils';
import './style.scss';
import { Overrides } from '../../interface';

interface Props {
	tex: string;
	nodeView: BaseNodeView;
}

interface InputProps {
	onChange?: (e: string) => void;
	onFinish?: (e: string) => void;
}

const TextInput = forwardRef<
	{ selectAll: () => void; clear: () => void },
	Overrides<HTMLAttributes<HTMLDivElement>, {}>
>(function ({ className, onChange }, ref) {
	const [val, setVal] = useState('');
	useImperativeHandle(ref, () => ({
		selectAll: () => {},
		clear: () => {
			setVal('');
		}
	}));
	return (
		<div
			className={classnames('text-input', className)}
			contentEditable
			dangerouslySetInnerHTML={{ __html: val.replaceAll('\n', '<br/>') }}
		/>
	);
});

function TexInputBox({ onChange, onFinish }: InputProps) {
	const text = useRef('');
	return (
		<div className="tex-input-box">
			<TextInput
				className="tex-input"
				// onChange={(e) => {
				// 	text.current = e.target.value;
				// 	onChange && onChange(e.target.value);
				// }}
				// onKeyUp={(e) => e.key === 'Enter' && onFinish && onFinish(text.current)}
			/>
			<div className="tex-input-extra">
				<Button
					onClick={() => onFinish && onFinish(text.current)}
					variant="contained"
					size="small"
				>
					完成
					<SvgKBReturn style={{ fontSize: '1.25em' }} />
				</Button>
			</div>
		</div>
	);
}

export const MathBlockNode = ({ tex, nodeView }: Props) => {
	const { $dom } = useNodeView(nodeView);
	const $content = useRef<HTMLDivElement>(null);
	const [txt, setTxt] = useState('');
	useEffect(() => {
		katex.render(txt, $dom.current);
	}, [txt]);
	useEffect(() => {
		katex.render(tex, $content.current);
	}, [tex]);
	const body = (
		<div ref={$dom} className="math-block-node">
			<Menu
				trigger="click"
				content={
					<TexInputBox
						onChange={setTxt}
						onFinish={(t) => nodeView.setNodeAttribute('tex', t)}
					/>
				}
			>
				<div ref={$content} className="math-block-content"></div>
			</Menu>
		</div>
	);
	return <Tools>{body}</Tools>;
};

export const MathInlineNode = ({ tex, nodeView }: Props) => {
	const { $dom } = useNodeView<HTMLSpanElement>(nodeView);
	const [txt, setTxt] = useState('');
	useEffect(() => {
		if (txt) katex.render(txt, $dom.current);
	}, [txt]);

	useEffect(() => {
		setTxt(tex);
	}, [tex]);

	const body = (
		<span
			ref={$dom}
			className={classnames('math-inline-node', { empty: !tex })}
		>
			{!txt && (
				<>
					<Icon name="functions" />
					输入公式
				</>
			)}
		</span>
	);
	return (
		<Menu
			trigger="click"
			content={
				<TexInputBox
					onChange={setTxt}
					onFinish={(t) => nodeView.setNodeAttribute('tex', t)}
				/>
			}
		>
			{body}
		</Menu>
	);
};
