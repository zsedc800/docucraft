import { useEffect, useState } from '@docucraft/srender';
import { CodeBlockView } from './codeBlockView';
import { classnames } from '../../utils';
import Switch from '@mui/material/Switch';
import Icon from '@docucraft/icons';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { toggleLineNumber } from './extensions';
import { setLanguage } from './extensions/loadLanguage';
import LangPicker from './LangPicker';
import { useNodeView } from '../../utils/view';
import Tools from '../toolBar/Tools';
import './style.scss';
interface Props {
	nodeView: CodeBlockView;
	language: string;
	theme: string;
	showLineNumber?: boolean;
	hidden?: boolean;
}

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
	const { $dom } = useNodeView<HTMLPreElement>(nodeView);

	useEffect(() => {
		setLanguage(language, nodeView.cmv);
	}, []);

	const body = (
		<pre
			ref={$dom}
			contentEditable={false}
			className={classnames('docucraft-codeblock', { hidden })}
			data-node-type="codeBlock"
			data-language={language}
			data-theme={theme}
			data-show-line-number={showLineNumber}
		>
			<ThemeProvider theme={darkTheme}>
				<div contentEditable={false} className="code-block-menu-container">
					<div contentEditable={false} className="code-block-menu">
						<div contentEditable={false} className="code-block-menu-content">
							<LangPicker
								value={language}
								onChange={(val) => {
									const { state, dispatch } = nodeView.view;
									const language = val?.name.toLowerCase() || 'plaintext';
									state.schema.cached.lastLanguage = language;

									nodeView.setNodeAttribute('language', language);
								}}
							/>
						</div>
						<div className="code-block-menu-tile">
							<Switch
								size="small"
								color="default"
								checked={showLineNumber}
								onChange={(_, val) => {
									nodeView.setNodeAttribute('showLineNumber', val);
									toggleLineNumber(nodeView.cmv, val);
								}}
							/>
							<CopyBtn nodeView={nodeView} />
						</div>
					</div>
				</div>
			</ThemeProvider>
			<code
				ref={(dom) => (nodeView.codeContainer = dom)}
				className="scrollbar dc-block"
				data-node-type="codeBlock"
				data-language={language}
				data-theme={theme}
				data-show-line-number={showLineNumber}
			/>
		</pre>
	);
	return <Tools>{body}</Tools>;
};
