import React, { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom/client';
import { CodeBlockView } from './codeBlockView';
import './style.scss';

const languages = [
  'plaintext',
  'javascript',
  'html',
  'markdown',
  'typescript',
  'python',
  'java',
]

const CodeBlock = ({ nodeView }: { nodeView: CodeBlockView }) => {
  const $code = useRef<HTMLElement>(null);
  const { language, showLineNumber } = nodeView.node.attrs;
  useEffect(() => {
    console.log('mount');

    // nodeView.contentDOM = $code.current;

  }, []);
  return (
    <>
      <div className="code-block-menu">
        <div className="code-block-menu-content">
          <select className='code-type-select' onChange={(e) => {

            const { state, dispatch } = nodeView.view;
            const language = e.target.value;
            const pos = nodeView.getPos() as number;
            state.schema.cached.lastLanguage = language;
            if (pos || pos == 0) {
              const tr = state.tr.setNodeAttribute(pos, 'language', language);
              dispatch(tr);
              setTimeout(() => nodeView.view.focus(), 16);
            }
          }}>
            {languages.map(lang => <option value={lang} selected={lang === language}>{lang}</option>)}
          </select>
        </div>
        <div className="code-block-menu-tile">
          {/* <button onClick={() => {
            const { state, dispatch } = nodeView.view;

            const pos = nodeView.getPos();
            if (pos || pos == 0) {
              const tr = state.tr.setNodeAttribute(
                pos,
                'showLineNumber',
                !showLineNumber
              );
              dispatch(tr);
              setTimeout(() => nodeView.view.focus(), 16);
            }
          }}>{showLineNumber ? '隐藏行号' : '展示行号'}</button> */}
          <div className='btn' onClick={() => {
            navigator.clipboard
              .writeText(nodeView.node.textContent)
              .then(() => {
                alert('copied!');
              });
          }}>复制</div>
        </div>
      </div>
      {/* <code
        ref={$code}
        lang={language}
        className={
          `code-block language-typescript ${showLineNumber ? 'show-line-number' : ''}`}></code> */}
    </>
  );
}

export const setup = (nodeView: CodeBlockView) => {
  nodeView.root.render(<CodeBlock nodeView={nodeView} />);
}

