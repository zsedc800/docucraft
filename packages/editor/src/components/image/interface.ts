import { ImageNodeView } from './view';

export interface BaseProps {
	nodeView: ImageNodeView;
}
export interface ImageRect {
	left: number;
	top: number;
	width: number;
	height: number;
}

export interface CropProps extends BaseProps {
	onCrop?: (e: ImageRect) => void;
}

export interface ResizeProps {
	onResize?: (w: number) => void;
}
