'use client';
import { useEffect, useRef } from 'react';
import { setupEditor } from '@docucraft/editor';
import 'katex/dist/katex.min.css';
import '@docucraft/editor/dist/style.css';

const Editor = () => {
	const editorContainer = useRef<HTMLDivElement>(null);
	useEffect(() => {
		console.log('counter');

		const destroy = setupEditor(editorContainer.current);
		return destroy;
	}, []);

	return (
		<div className="wrap">
			<div ref={editorContainer} id="editorContainer"></div>
		</div>
	);
};

export default Editor;
