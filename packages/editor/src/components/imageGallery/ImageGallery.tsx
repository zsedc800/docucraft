import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { useRef } from '@docucraft/srender';
import SvgZoom from '@docucraft/icons/svg/ZoomIn';
import SvgDelete from '@docucraft/icons/svg/Delete';
import { useNodeView } from '../../utils/view';
import { ImageGalleryView } from './view';
import Menu from '../../kits/Menu';
import { MediaPendingBlock } from '../../kits/PendingBlock';
import ImageTools from './ImageTools';
import Tools from '../toolBar/Tools';
import { ImageItem } from '../../interface';
import { useEffect } from 'react';
import Viewer from 'viewerjs';
import { ToggleButton } from '../../kits/ToggleButton';
import 'viewerjs/dist/viewer.css';

interface Props {
	images: ImageItem[];
	layout: 'masonry' | 'quilted' | 'standard' | 'woven';
	nodeView: ImageGalleryView;
	cols: number;
}

interface GalleryItem extends ImageItem {
	cols?: number;
	rows?: number;
}

const buildMaps =
	(map = [4, 2]) =>
	(count: number) => {
		const res = [map.concat()];
		let i = 1,
			index = 0,
			flag = 1,
			reverse = false;
		while (i < count) {
			const [cols, rows] = res[index];
			if (cols === 1 && rows === 1) {
				res.push(map.concat());
				index = res.length - 1;
				reverse = !reverse;
				i++;
				flag = 1;
				continue;
			}
			if (flag) {
				res.splice(index, 1, [cols / 2, rows], [cols / 2, rows]);
				if (!reverse) index++;
				flag = 0;
			} else {
				if (reverse) {
					res.splice(index, 1, [cols, rows / 2]);
					index += 2;
					res.splice(index, 0, [cols, rows / 2]);
				} else {
					res.splice(index, 1, [cols, rows / 2], [cols, rows / 2]);
				}
				flag = 1;
			}
			i++;
		}
		return res;
	};

const buildMap = buildMaps();

export default ({ nodeView, images, layout, cols = 3 }: Props) => {
	const { $dom } = useNodeView(nodeView);
	images = images ?? [];

	const viewer = useRef<Viewer | null>(null);
	let itemData: GalleryItem[] = images;
	if (layout === 'quilted') {
		const posMap = images.length > 0 ? buildMap(images.length) : [];
		itemData = images.map((item, index) => {
			const [cols, rows] = posMap[index];
			return { ...item, cols, rows };
		});
	}

	useEffect(() => {
		if (viewer.current) {
			viewer.current.update();
		} else {
			viewer.current = new Viewer($dom.current, {
				title: false
			});
			// hack cancel click event to auto open
			$dom.current.removeEventListener(
				'click',
				(viewer.current as any).onStart
			);
		}

		return () => {
			viewer.current?.destroy();
		};
	}, [images]);

	const pending = (
		<MediaPendingBlock nodeView={nodeView}>添加图片</MediaPendingBlock>
	);

	const body = (
		<Menu content={<ImageTools />} placement="top-end">
			<ImageList
				variant={layout}
				cols={layout === 'quilted' ? 4 : cols}
				gap={4}
			>
				{itemData.map((item, index) => (
					<ImageListItem
						className="image-gallery-item"
						cols={item.cols}
						rows={item.rows}
					>
						<img loading="lazy" src={item.src} />
						<div className="image-item-tools flex-center">
							<ToggleButton
								title="查看大图"
								onClick={() => viewer.current?.view(index)}
							>
								<SvgZoom />
							</ToggleButton>
							<ToggleButton
								onClick={() =>
									nodeView.setNodeAttribute(
										'images',
										images.filter((_, i) => i !== index)
									)
								}
							>
								<SvgDelete />
							</ToggleButton>
						</div>
					</ImageListItem>
				))}
			</ImageList>
		</Menu>
	);

	return (
		<Tools>
			<div className="image-gallery" ref={$dom}>
				{images.length > 0 ? body : pending}
			</div>
		</Tools>
	);
};
