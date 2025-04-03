'use client';
import { useEffect, useRef, useState } from 'react';
import DocEditor from '@docucraft/editor';
import 'katex/dist/katex.min.css';
import '@docucraft/editor/dist/style.css';
import { openFile, restoreFileHandle, saveFileHandle } from './fileAccess';
import FileChoose from './FileChoose';

let fileHandle: FileSystemFileHandle | undefined;

function debounce(fn: (...args: any[]) => any, wait: number) {
	let timeout: NodeJS.Timeout, res: any;
	return function (this: any, ...args: any[]) {
		const context = this;

		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => (res = fn.apply(context, args)), wait);
		return res;
	};
}

async function save(content: string) {
	if (!fileHandle) return;
	const writeStream = await fileHandle.createWritable();
	await writeStream.write(content);
	await writeStream.close();
}
const Editor = () => {
	const editorContainer = useRef<HTMLDivElement>(null);
	const editor = useRef<DocEditor>();
	const [open, setOpen] = useState(false);
	useEffect(() => {
		console.log('counter');
		let isDestroyed = false;
		const edit = (editor.current = new DocEditor(editorContainer.current!));
		edit.onChange(
			debounce((content) => {
				save(content);
			}, 1000)
		);
		restoreFileHandle('example-file').then(async (f) => {
			if (isDestroyed) return;
			if (f) {
				fileHandle = f;
				const file = await fileHandle.getFile();
				const text = await file.text();
				if (text) edit.parseJSON(text);
			} else {
				setOpen(true);
			}
		});
		return () => {
			isDestroyed = true;
			editor.current?.destroy();
		};
	}, []);

	return (
		<div className="wrap">
			<div ref={editorContainer} id="editorContainer"></div>
			<FileChoose
				open={open}
				onChoose={async () => {
					const [text, f] = await openFile();
					fileHandle = f;
					text && editor.current?.parseJSON(text);
					saveFileHandle(fileHandle, 'example-file');
					setOpen(false);
				}}
			/>
		</div>
	);
};

export default Editor;
