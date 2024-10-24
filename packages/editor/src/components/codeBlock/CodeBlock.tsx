import { useLayoutEffect, useRef, useState } from '@docucraft/srender';
import { CodeBlockView } from './codeBlockView';
import { classnames } from '../../utils';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import Icon from '@docucraft/icons';
import './style.scss';
import { ThemeProvider, createTheme } from '@mui/material/styles';
interface Props {
	nodeView: CodeBlockView;
	language: string;
	theme: string;
	showLineNumber?: boolean;
	hidden?: boolean;
}

const languages = [
	'plaintext',
	'javascript',
	'html',
	'markdown',
	'typescript',
	'python',
	'java'
];

const CopyBtn = ({ nodeView }: { nodeView: CodeBlockView }) => {
	const [copied, setCopied] = useState(false);
	return (
		<div
			className="copy-btn"
			onClick={() => {
				navigator.clipboard.writeText(nodeView.node.textContent).then(() => {
					setCopied(true);
					setTimeout(() => setCopied(false), 2000);
				});
			}}
		>
			<Icon name={copied ? 'check' : 'content_copy'} />
			{copied ? '已复制！' : '复制代码'}
		</div>
	);
};
const darkTheme = createTheme({
	palette: {
		mode: 'dark'
	}
});
export default ({
	nodeView,
	language,
	theme,
	showLineNumber,
	hidden = false
}: Props) => {
	const dom = useRef<HTMLPreElement>();
	const contentDOM = useRef<HTMLElement>();
	useLayoutEffect(() => {
		if (dom.current) nodeView.dom = dom.current;
		// nodeView.contentDOM = contentDOM.current;
		nodeView.codeContainer = contentDOM.current;
	}, []);
	return (
		<pre
			ref={dom}
			className={classnames('docucraft-codeblock', { hidden })}
			data-node-type="codeBlock"
			data-language={language}
			data-theme={theme}
			data-show-line-number={showLineNumber}
		>
			<ThemeProvider theme={darkTheme}>
				{/* @ts-ignore */}
				<div contentEditable={false} className="code-block-menu-container">
					<div className="code-block-menu">
						<div className="code-block-menu-content">
							<Select
								size="small"
								variant="filled"
								className="code-type-select"
								value={language}
								IconComponent={() => null}
								sx={{
									'&': {
										borderRadius: '4px' // 保持圆角效果
									},
									'&:before': {
										borderBottom: 'none' // 移除未聚焦时的下划线
									},
									'&:after': {
										borderBottom: 'none' // 移除聚焦后的下划线
									},
									'&:hover:not(.Mui-disabled):before': {
										borderBottom: 'none' // 移除悬停时的下划线
									},
									'& .MuiSelect-select': {
										padding: '0 5px',
										paddingRight: '5px !important'
									}
								}}
								onChange={(e: any) => {
									const { state, dispatch } = nodeView.view;
									const language = e.target?.value;
									const pos = nodeView.getPos() as number;
									state.schema.cached.lastLanguage = language;
									if (pos || pos == 0) {
										const tr = state.tr.setNodeAttribute(
											pos,
											'language',
											language
										);
										dispatch(tr);
										setTimeout(() => nodeView.view.focus(), 16);
									}
								}}
							>
								{languages.map(
									(lang) => (<MenuItem value={lang}>{lang}</MenuItem>) as any
								)}
							</Select>
						</div>
						<div className="code-block-menu-tile">
							<Switch
								size="small"
								color="default"
								checked={showLineNumber}
								onChange={(e) => {
									const { state, dispatch } = nodeView.view;
									console.log(e, 'ee');

									const pos = nodeView.getPos();
									if (pos || pos == 0) {
										const tr = state.tr.setNodeAttribute(
											pos,
											'showLineNumber',
											!showLineNumber
										);
										dispatch(tr);
										// setTimeout(() => nodeView.view.focus(), 16);
									}
								}}
							/>
							<CopyBtn nodeView={nodeView} />
						</div>
					</div>
				</div>
			</ThemeProvider>
			<code
				ref={contentDOM}
				className="scrollbar dc-block"
				data-node-type="codeBlock"
				data-language={language}
				data-theme={theme}
				data-show-line-number={showLineNumber}
			></code>
		</pre>
	);
};
