import Paper from '@mui/material/Paper';

import { CSSProperties, useEffect, useRef, useState } from '@docucraft/srender';
import { BaseNodeView, useNodeView } from '../../utils/view';
import Menu from '../../kits/Menu';
import ImageTools from './ImageTools';
import { initCroper, initResizer } from './buildTools';
import Tools from '../toolBar/Tools';
import { MediaPendingBlock } from '../../kits/PendingBlock';
import { classnames, shallowEqual } from '../../utils';
import { BaseProps, CropProps, ImageRect, ResizeProps } from './interface';

interface Props extends BaseProps {
	title: string;
	alt: string;
	src: string;
	srcSet: string;
	loading: 'lazy' | 'eager';
	link: string;
	width: number | 'auto';
	align: 'left' | 'center' | 'right';
	clip: ImageRect | null;
	origin: Omit<ImageRect, 'left' | 'top'>;
}

function ResizeBar({ onResize }: ResizeProps) {
	const resizeBox = useRef<HTMLDivElement>(null);
	useEffect(() => {
		resizeBox.current && initResizer(resizeBox.current, { onResize });
	}, []);
	return (
		<div ref={resizeBox} className="resizer-box">
			<div data-placement="tl" className="resizer resizer-tl"></div>
			<div data-placement="tr" className="resizer resizer-tr"></div>
			<div data-placement="bl" className="resizer resizer-bl"></div>
			<div data-placement="br" className="resizer resizer-br"></div>
			<span className="text"></span>
		</div>
	);
}

function CropBar({ nodeView, onCrop }: CropProps) {
	const cropBox = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (!cropBox.current) return;
		initCroper(cropBox.current, { nodeView, onCrop });
	}, []);

	const box = (
		<div ref={cropBox} className="croper-box">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				data-placement="tl"
				className="croper croper-tl"
			>
				<path
					d="M2,18 L2,2 L18,2"
					stroke="currentColor"
					strokeWidth="4"
					strokeLinecap="round"
					strokeLinejoin="round"
					fill="none"
				/>
			</svg>
			<svg viewBox="0 0 20 20" data-placement="tr" className="croper croper-tr">
				<path
					d="M2,2 L18,2 L18,18"
					stroke="currentColor"
					strokeWidth="4"
					strokeLinecap="round"
					strokeLinejoin="round"
					fill="none"
				/>
			</svg>
			<svg viewBox="0 0 20 20" data-placement="bl" className="croper croper-bl">
				<path
					d="M2,2 L2,18  L18,18"
					stroke="currentColor"
					strokeWidth="4"
					strokeLinecap="round"
					strokeLinejoin="round"
					fill="none"
				/>
			</svg>
			<svg viewBox="0 0 20 20" data-placement="br" className="croper croper-br">
				<path
					d="M2,18  L18,18 L18,2"
					stroke="currentColor"
					strokeWidth="4"
					strokeLinecap="round"
					strokeLinejoin="round"
					fill="none"
				/>
			</svg>
			<div data-placement="top" className="croper croper-top"></div>
			<div data-placement="right" className="croper croper-right"></div>
			<div data-placement="bottom" className="croper croper-bottom"></div>
			<div data-placement="left" className="croper croper-left"></div>
		</div>
	);

	return (
		<>
			<div className="crop-bg abs-full"></div>
			<div className="crop-area abs-full"></div>
			{box}
		</>
	);
}

export default ({
	title,
	src,
	nodeView,
	loading,
	link,
	width,
	align,
	clip,
	origin
}: Props) => {
	const { $dom } = useNodeView(nodeView);
	const [actived, setActived] = useState(false);
	const [cropStart, setCropStatus] = useState(false);
	const $clip = useRef<ImageRect>(clip);
	useEffect(() => {
		$dom.current?.addEventListener('dragstart', (e) => {
			e.preventDefault();
		});
	}, []);

	let boxStyle: CSSProperties = { width };
	let imgStyle: CSSProperties = {};
	if (clip && !cropStart) {
		if (width === 'auto') width = origin.width;
		const height = width * (clip.height / clip.width);
		boxStyle = { ...boxStyle, height };
		const w = (origin.width * width) / clip.width;
		const h = (origin.height * height) / clip.height;
		const ratio = width / clip.width;
		const offsetX = clip.left * ratio;
		const offsetY = clip.top * ratio;

		imgStyle.width = w;
		imgStyle.height = h;
		imgStyle.transform = `translate(${-offsetX}px, ${-offsetY}px)`;
		imgStyle.maxWidth = 'none';
	}

	let image = (
		<img
			className="image"
			style={imgStyle}
			src={src}
			loading={loading}
			title={title ?? ''}
			onLoad={(e) => {
				const img = e.currentTarget as HTMLImageElement;
				const { width, height } = img.getBoundingClientRect();
				nodeView.setNodeAttribute('origin', { width, height });
			}}
		/>
	);
	if (link)
		image = (
			<a target="_blank" href={link}>
				{image}
			</a>
		);

	const body = (
		<div
			ref={$dom}
			style={{ display: 'flex', justifyContent: align, marginBottom: 8 }}
		>
			{src ? (
				<Menu
					placement="top-end"
					content={
						<ImageTools
							onCropStart={() => {
								nodeView.setNodeAttribute('width', origin.width);
								console.log(origin, 'origin');
								setCropStatus(true);
							}}
						/>
					}
					onOpen={() => setActived(true)}
					onClose={() => {
						if ($clip.current && !shallowEqual($clip.current, clip)) {
							nodeView.setNodeAttributes({
								clip: $clip.current,
								width: $clip.current.width
							});
						}
						setActived(false);
						setCropStatus(false);
					}}
				>
					<div className={classnames('image-wrapper', { cropping: cropStart })}>
						<Paper style={boxStyle} className="image-box">
							{image}
						</Paper>
						{actived ? (
							cropStart ? (
								<CropBar
									onCrop={(clip) => ($clip.current = clip)}
									nodeView={nodeView}
								/>
							) : (
								<ResizeBar
									onResize={(w) => {
										nodeView.setNodeAttribute(
											'width',
											Math.min(origin.width, w)
										);
									}}
								/>
							)
						) : null}
					</div>
				</Menu>
			) : (
				<MediaPendingBlock nodeView={nodeView}>添加图片</MediaPendingBlock>
			)}
		</div>
	);
	return <Tools>{body}</Tools>;
};
