'use client';
import { useEffect, useRef, useState } from 'react';
import { setupEditor } from '@docucraft/editor';
import 'katex/dist/katex.min.css';
import '@docucraft/editor/dist/style.css';
import { openFile, restoreFileHandle, saveFileHandle } from './fileAccess';
import FileChoose from './FileChoose';

let writeStream: FileSystemWritableFileStream | undefined;

const Editor = () => {
	const editorContainer = useRef<HTMLDivElement>(null);
	const [open, setOpen] = useState(false);
	useEffect(() => {
		console.log('counter');

		const destroy = setupEditor(editorContainer.current, {
			onChange: (content) => {
				console.log(content);
				console.log(writeStream, 'xxx');

				writeStream?.write(content);
				writeStream.flush;
			}
		});
		return destroy;
	}, []);
	useEffect(() => {
		restoreFileHandle('example-file').then(async (fileHandle) => {
			console.log(fileHandle, 'file');
			if (fileHandle) {
				writeStream = await fileHandle.createWritable();
			} else {
				setOpen(true);
			}
		});
	}, []);

	return (
		<div className="wrap">
			<div ref={editorContainer} id="editorContainer"></div>
			<FileChoose
				open={open}
				onChoose={async () => {
					const [text, fileHandle] = await openFile();
					writeStream = await fileHandle.createWritable();
					saveFileHandle(fileHandle, 'example-file');
					setOpen(false);
				}}
			/>
		</div>
	);
};

export default Editor;
