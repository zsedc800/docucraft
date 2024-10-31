import { useLayoutEffect, useMemo, useRef, useState } from '@docucraft/srender';
import { CodeBlockView } from './codeBlockView';
import { classnames } from '../../utils';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import Icon from '@docucraft/icons';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { toggleLineNumber } from './extensions';
import { setLanguage } from './extensions/loadLanguage';
import { languages } from '@codemirror/language-data';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import './style.scss';
import Example, { CustomInputAutocomplete } from './Example';
import LangPicker from './LangPicker';
interface Props {
	nodeView: CodeBlockView;
	language: string;
	theme: string;
	showLineNumber?: boolean;
	hidden?: boolean;
}

// const languages = [
// 	'plaintext',
// 	'javascript',
// 	'html',
// 	'markdown',
// 	'typescript',
// 	'python',
// 	'java'
// ];

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
	const options = useMemo(
		() =>
			languages.map(({ name }) => ({
				label: name,
				value: name.toLowerCase()
			})),
		[]
	);
	return (
		<pre
			ref={dom}
			contentEditable={false}
			className={classnames('docucraft-codeblock', { hidden })}
			data-node-type="codeBlock"
			data-language={language}
			data-theme={theme}
			data-show-line-number={showLineNumber}
		>
			<ThemeProvider theme={darkTheme}>
				{/* @ts-ignore */}
				<div contentEditable={false} className="code-block-menu-container">
					<div contentEditable={false} className="code-block-menu">
						<div contentEditable={false} className="code-block-menu-content">
							<LangPicker
								value={language}
								onChange={(val) => {
									const { state, dispatch } = nodeView.view;
									const language = val?.name.toLowerCase() || 'plaintext';
									const pos = nodeView.getPos() as number;
									state.schema.cached.lastLanguage = language;
									if (pos || pos == 0) {
										const tr = state.tr.setNodeAttribute(
											pos,
											'language',
											language
										);
										dispatch(tr);
										setLanguage(language, nodeView.cmv);
									}
								}}
							/>
						</div>
						<div className="code-block-menu-tile">
							<Switch
								size="small"
								color="default"
								checked={showLineNumber}
								onChange={(e) => {
									const { state, dispatch } = nodeView.view;
									console.log(111);

									const pos = nodeView.getPos();
									if (pos || pos == 0) {
										const tr = state.tr.setNodeAttribute(
											pos,
											'showLineNumber',
											!showLineNumber
										);
										dispatch(tr);
										toggleLineNumber(nodeView.cmv, !showLineNumber);
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
