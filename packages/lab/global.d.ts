export {};

declare global {
	interface Window {
		showOpenFilePicker: (
			options?: OpenFilePickerOptions
		) => Promise<FileSystemFileHandle[]>;
		showSaveFilePicker: (
			options?: SaveFilePickerOptions
		) => Promise<FileSystemFileHandle>;
		showDirectoryPicker: (
			options?: DirectoryPickerOptions
		) => Promise<FileSystemDirectoryHandle>;
	}

	// 文件系统通用句柄
	interface FileSystemHandle {
		readonly kind: 'file' | 'directory';
		readonly name: string;
		isSameEntry(other: FileSystemHandle): Promise<boolean>;
		queryPermission(
			descriptor?: FileSystemPermissionDescriptor
		): Promise<PermissionState>;
		requestPermission(
			descriptor?: FileSystemPermissionDescriptor
		): Promise<PermissionState>;
	}

	// 文件句柄
	interface FileSystemFileHandle extends FileSystemHandle {
		readonly kind: 'file';
		getFile(): Promise<File>;
		createWritable(
			options?: FileSystemCreateWritableOptions
		): Promise<FileSystemWritableFileStream>;
	}

	// 目录句柄
	interface FileSystemDirectoryHandle extends FileSystemHandle {
		readonly kind: 'directory';
		getFileHandle(
			name: string,
			options?: FileSystemGetFileOptions
		): Promise<FileSystemFileHandle>;
		getDirectoryHandle(
			name: string,
			options?: FileSystemGetDirectoryOptions
		): Promise<FileSystemDirectoryHandle>;
		removeEntry(name: string, options?: FileSystemRemoveOptions): Promise<void>;
		resolve(possibleDescendant: FileSystemHandle): Promise<string[] | null>;
		entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
		keys(): AsyncIterableIterator<string>;
		values(): AsyncIterableIterator<FileSystemHandle>;
	}

	// 文件写入流
	interface FileSystemWritableFileStream extends WritableStream {
		write(
			data: BufferSource | Blob | string | FileSystemWriteChunkType
		): Promise<void>;
		close(): Promise<void>;
		seek(position: number): Promise<void>;
		truncate(size: number): Promise<void>;
	}

	// 其他辅助类型
	interface FileSystemPermissionDescriptor {
		mode?: 'read' | 'readwrite';
	}

	interface FileSystemCreateWritableOptions {
		keepExistingData?: boolean;
	}

	interface FileSystemGetFileOptions {
		create?: boolean;
	}

	interface FileSystemGetDirectoryOptions {
		create?: boolean;
	}

	interface FileSystemRemoveOptions {
		recursive?: boolean;
	}

	type FileSystemWriteChunkType = BufferSource | Blob | string;

	interface OpenFilePickerOptions {
		multiple?: boolean;
		types?: FilePickerAcceptType[];
		excludeAcceptAllOption?: boolean;
	}

	interface SaveFilePickerOptions {
		suggestedName?: string;
		types?: FilePickerAcceptType[];
		excludeAcceptAllOption?: boolean;
	}

	interface DirectoryPickerOptions {
		id?: string;
		mode?: 'read' | 'readwrite';
	}

	interface FilePickerAcceptType {
		description?: string;
		accept: Record<string, string[]>;
	}
}
