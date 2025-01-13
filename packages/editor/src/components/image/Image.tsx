import Paper from '@mui/material/Paper';
import { BaseNodeView, useNodeView } from '../../utils/view';
import { ImageNodeView } from './view';
import Menu from '../../kits/Menu';
import { useEffect, useRef, useState } from '@docucraft/srender';
import ImageTools from './ImageTools';
import { initResizer } from './buildTools';
import Tools from '../toolBar/Tools';
import { MediaPendingBlock } from '../../kits/PendingBlock';
interface Props {
	title: string;
	alt: string;
	src: string;
	srcSet: string;
	loading: 'lazy' | 'eager';
	nodeView: ImageNodeView;
	link: string;
	width: number;
	align: 'left' | 'center' | 'right';
}

function ResizeBar({ nodeView }: { nodeView: BaseNodeView }) {
	const resizeBox = useRef<HTMLDivElement>(null);
	useEffect(() => {
		resizeBox.current && initResizer(resizeBox.current, nodeView);
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

export default ({
	title,
	src,
	srcSet,
	nodeView,
	loading,
	link,
	width,
	align
}: Props) => {
	const { $dom } = useNodeView(nodeView);
	let image = <img src={src} loading={loading} title={title ?? ''} />;
	if (link)
		image = (
			<a target="_blank" href={link}>
				{image}
			</a>
		);
	const [actived, setActived] = useState(false);
	useEffect(() => {
		$dom.current?.addEventListener('dragstart', (e) => {
			e.preventDefault();
		});
	}, []);
	const body = (
		<div
			ref={$dom}
			style={{ display: 'flex', justifyContent: align, marginBottom: 8 }}
		>
			{src ? (
				<Menu
					placement="top-end"
					content={<ImageTools />}
					onOpen={() => setActived(true)}
					onClose={() => setActived(false)}
				>
					<div className="image-wrapper">
						<Paper style={{ width }} className="image-box">
							{image}
						</Paper>
						{actived && <ResizeBar nodeView={nodeView} />}
					</div>
				</Menu>
			) : (
				<MediaPendingBlock nodeView={nodeView}>添加图片</MediaPendingBlock>
			)}
		</div>
	);
	return <Tools>{body}</Tools>;
};
