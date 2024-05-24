import { Node } from 'prosemirror-model';
import React, { useLayoutEffect } from 'react'
import ReactDOM from 'react-dom/client';

const CodeBlock = ({ node }: { node: Node }) => {
  useLayoutEffect(() => {

  }, []);
  return (
    <pre>
      <div className="code-block-menu-container"></div>

    </pre>
  );
}

export const setup = (dom: HTMLElement, node: Node) => {
  const root = ReactDOM.createRoot(dom);
  root.render(<CodeBlock node={node} />);

  return () => root.unmount();
}

