let writeStream: FileSystemWritableFileStream | undefined;
export async function openFile(options?: OpenFilePickerOptions) {
	if (!window.showOpenFilePicker) {
		throw new Error('当前浏览器不支持 File System Access API');
	}
	const [fileHandle] = await window.showOpenFilePicker(options);

	const file = await fileHandle.getFile();
	const text = await file.text();
	return [text, fileHandle] as const;
}

export async function saveFile(options: SaveFilePickerOptions) {
	if (!window.showSaveFilePicker) {
		throw new Error('当前浏览器不支持 File System Access API');
	}
	const fileHandle = await window.showSaveFilePicker(options);
	return fileHandle;
}

export async function saveFileHandle(
	fileHandle: FileSystemFileHandle,
	id: string
) {
	const db = indexedDB.open('fileHandlesDB', 2);

	db.onupgradeneeded = () => {
		console.log('onupgrade');

		db.result.createObjectStore('handles', { keyPath: 'id' });
	};

	db.onsuccess = () => {
		const transaction = db.result.transaction('handles', 'readwrite');
		const store = transaction.objectStore('handles');
		store.put({ id, handle: fileHandle });
	};
}

export async function restoreFileHandle(
	id: string
): Promise<FileSystemFileHandle | null> {
	return new Promise((resolve) => {
		const db = indexedDB.open('fileHandlesDB', 2);

		db.onsuccess = async () => {
			let transaction: IDBTransaction | undefined;
			try {
				transaction = db.result.transaction('handles', 'readonly');
			} catch (e) {
				return resolve(null);
			}
			const store = transaction.objectStore('handles');
			const request = store.get(id);

			request.onsuccess = async () => {
				if (request.result) {
					const fileHandle: FileSystemFileHandle = request.result.handle;

					// 检查权限
					const permission = await fileHandle.queryPermission({
						mode: 'readwrite'
					});
					console.log(permission, 'mis');

					if (permission === 'granted') {
						resolve(fileHandle);
					} else {
						resolve(null);
					}
				} else {
					resolve(null);
				}
			};
		};
	});
}

export async function save(content: string) {
	return writeStream?.write(content);
}
