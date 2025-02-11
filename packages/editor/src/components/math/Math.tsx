import katex from 'katex';
import { useEffect, useRef, useState } from '@docucraft/srender';
import Button from '@mui/material/Button';
import SvgKBReturn from '@docucraft/icons/svg/KeyboardReturn';
import Icon from '@docucraft/icons';
import { BaseNodeView, useNodeView } from '../../utils/view';
import Tools from '../toolBar/Tools';
import Menu from '../../kits/Menu';
import { RichTextArea, RichTextAreaRef } from '../../kits/Input';
import { classnames, nextTick } from '../../utils';
import { BaseProps } from '../../interface';
import './style.scss';

interface Props {
	tex: string;
	nodeView: BaseNodeView;
}

interface InputProps {
	onChange?: (e: string) => void;
	onFinish?: (e: string) => void;
	value?: string;
}

function TexInputBox({
	onChange,
	onFinish,
	value,
	...props
}: BaseProps<InputProps>) {
	const ctx = useRef<RichTextAreaRef>({} as RichTextAreaRef);
	useEffect(() => {
		if (value) ctx.current.selectAll();
	}, []);
	return (
		<div className="tex-input-box" {...props}>
			<RichTextArea
				ref={ctx}
				value={value}
				className="tex-input"
				onChange={onChange}
				// onChange={(e) => {
				// 	text.current = e.target.value;
				// 	onChange && onChange(e.target.value);
				// }}
				// onKeyUp={(e) => e.key === 'Enter' && onFinish && onFinish(text.current)}
			/>
			<div className="tex-input-extra">
				<Button
					onClick={() => onFinish && onFinish(ctx.current.value())}
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
				placement="bottom"
				content={
					<TexInputBox
						onChange={setTxt}
						onFinish={(t) => nodeView.setNodeAttribute('tex', t)}
					/>
				}
			>
				<div ref={$content} className="math-block-content" />
			</Menu>
		</div>
	);
	return <Tools>{body}</Tools>;
};

export const MathInlineNode = ({ tex, nodeView }: Props) => {
	const { $dom } = useNodeView<HTMLSpanElement>(nodeView);
	const $katex = useRef<HTMLSpanElement>(null);
	const [txt, setTxt] = useState('');
	console.log(tex, 'texxx');

	useEffect(() => {
		if (txt) katex.render(txt, $katex.current);
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
			<span ref={$katex} />
		</span>
	);
	return (
		<Menu
			trigger="click"
			placement="bottom"
			onClose={() => {
				console.log(tex, nodeView.node.attrs, 'attrs');

				setTxt(tex);
			}}
			content={({ close }) => (
				<TexInputBox
					style={{ width: 280 }}
					value={txt}
					onChange={setTxt}
					onFinish={(t) => {
						console.log(t, 'xxx');
						nodeView.setNodeAttribute('tex', t);
						close && close(false);
					}}
				/>
			)}
		>
			{body}
		</Menu>
	);
};
