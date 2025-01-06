import { Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import upload from './upload';
import { createNode } from '../../commands';
import { schema } from '../../model';
import './style.scss';

export { imageNodeSpec } from './schema';
export { ImageNodeView, ImageNodeViewConstructor } from './view';

export function handleImagePaste() {
	return new Plugin({
		props: {
			handlePaste(view, event, slice) {
				console.log(slice, 'slice');

				const files = event.clipboardData?.files;
				// if (files?.length) {
				// 	const imageFiles = Array.from(files).filter((file) =>
				// 		file.type.startsWith('image/')
				// 	);
				// 	(async () => {
				// 		await Promise.all(
				// 			imageFiles.map(async (file) => {
				// 				const url = await upload(file);
				// 				view.dispatch(
				// 					view.state.tr.replaceSelectionWith(
				// 						createNode(schema.nodes.image, { src: url })
				// 					)
				// 				);
				// 			})
				// 		);
				// 	})();
				// 	return true;
				// }
				return false;
			}
		}
	});
}
