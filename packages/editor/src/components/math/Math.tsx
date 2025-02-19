import katex from 'katex';
import { useEffect, useRef, useState } from '@docucraft/srender';

import Icon from '@docucraft/icons';
import TexInputBox from './TexInput';
import { BaseNodeView, useNodeView } from '../../utils/view';
import Tools from '../toolBar/Tools';
import Menu from '../../kits/Menu';
import { classnames } from '../../utils';
import './style.scss';

interface Props {
	tex: string;
	nodeView: BaseNodeView;
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
	const [errorMsg, setError] = useState('');

	useEffect(() => {
		if (txt) {
			try {
				katex.render(txt, $katex.current);
				setError('');
			} catch (error) {
				const { message = '' } = error || {};
				setError(message.replace('KaTeX parse error: ', ''));
			}
		}
	}, [txt]);

	useEffect(() => {
		setTxt(tex);
	}, [tex]);

	useEffect(() => {
		console.log(11123);

		if (!txt)
			$dom.current.dispatchEvent(new MouseEvent('click', { bubbles: true }));
	}, []);

	const body = (
		<span
			ref={$dom}
			className={classnames('math-inline-node', { empty: !tex })}
		>
			{txt ? null : (
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
			slotProps={{ paper: { style: { borderRadius: 10, marginTop: 4 } } }}
			onClose={() => setTxt(tex)}
			content={({ close }) => (
				<TexInputBox
					style={{ width: 280 }}
					value={txt}
					onChange={setTxt}
					placeholder='输入公式，如："E=m^2"'
					errorMsg={errorMsg}
					onFinish={(t) => {
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
