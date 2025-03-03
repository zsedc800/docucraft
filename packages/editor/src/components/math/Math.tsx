import katex from 'katex';
import { useEffect, useRef, useState } from '@docucraft/srender';

import Icon from '@docucraft/icons';
import TexInputBox from './TexInput';
import { BaseNodeView, BaseNodeViewProps, useNodeView } from '../../utils/view';
import Tools from '../toolBar/Tools';
import Menu from '../../kits/Menu';
import { classnames, nextTick } from '../../utils';
import './style.scss';

interface Props extends BaseNodeViewProps {
	tex: string;
	nodeView: BaseNodeView;
}

function useMathTex<T extends HTMLElement = HTMLDivElement>({
	tex
}: Pick<Props, 'tex'>) {
	const $katex = useRef<T>(null);
	const [txt, setTxt] = useState('');
	const [errorMsg, setError] = useState('');

	useEffect(() => {
		if (txt) {
			try {
				katex.render(txt, $katex.current, {});
				setError('');
			} catch (error) {
				const { message = '' } = error || {};
				setError(message.replace('KaTeX parse error: ', ''));
			}
		} else if (errorMsg) setError('');
	}, [txt]);

	useEffect(() => {
		setTxt(tex);
	}, [tex]);

	return { txt, setTxt, errorMsg, $katex };
}

export const MathBlockNode = ({ tex, nodeView, selected }: Props) => {
	const { $dom } = useNodeView(nodeView);
	const $content = useRef<HTMLDivElement>(null);
	const { txt, setTxt, errorMsg, $katex } = useMathTex({ tex });
	useEffect(() => {
		if (!txt)
			$content.current.dispatchEvent(
				new MouseEvent('click', { cancelable: false, bubbles: true })
			);
	}, []);
	const body = (
		<div ref={$dom} className={classnames('math-block', { selected })}>
			<Menu
				trigger="click"
				placement="bottom"
				slotProps={{ paper: { style: { borderRadius: 10, marginTop: 4 } } }}
				onClose={() => setTxt(tex)}
				content={({ close }) => (
					<TexInputBox
						style={{
							width: 320,
							maxHeight: 320,
							overflow: 'auto'
						}}
						inputStyle={{ minHeight: 80 }}
						value={txt}
						onChange={setTxt}
						placeholder="输入公式，如：\int u \frac{\mathrm{d}v} &nbsp;&nbsp;&nbsp;&nbsp; {\mathrm{d}x} \,\mathrm{d} x = uv-\int \frac{\mathrm{d}u} &nbsp;&nbsp;&nbsp;&nbsp;{\mathrm{d}x}v\,\mathrm{d}x "
						errorMsg={errorMsg}
						onFinish={(t) => {
							nodeView.setNodeAttribute('tex', t);
							close && close(false);
						}}
					/>
				)}
			>
				<div
					ref={$content}
					className={classnames('math-block-content', { empty: !txt })}
				>
					{txt ? (
						<div className="tex-box" ref={$katex} />
					) : (
						<>添加一个Tex公式</>
					)}
				</div>
			</Menu>
		</div>
	);
	return <Tools>{body}</Tools>;
};

export const MathInlineNode = ({ tex, nodeView }: Props) => {
	const { $dom } = useNodeView<HTMLSpanElement>(nodeView);
	const { $katex, txt, setTxt, errorMsg } = useMathTex<HTMLSpanElement>({
		tex
	});

	useEffect(() => {
		if (!txt)
			$dom.current.dispatchEvent(
				new MouseEvent('click', { cancelable: false, bubbles: true })
			);
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
