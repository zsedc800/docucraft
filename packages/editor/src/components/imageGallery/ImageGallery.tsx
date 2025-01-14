import Paper from '@mui/material/Paper';
import { useEffect, useRef, useState } from '@docucraft/srender';
import { BaseNodeView, useNodeView } from '../../utils/view';
import { ImageGalleryView } from './view';
import Menu from '../../kits/Menu';
import { MediaPendingBlock } from '../../kits/PendingBlock';
import ImageTools from './ImageTools';
import Tools from '../toolBar/Tools';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { ImageItem } from '../../interface';

interface Props {
	images: ImageItem[];
	layout: 'masonry' | 'quilted' | 'standard' | 'woven';
	nodeView: ImageGalleryView;
}

interface ItemSize {
	cols: number;
	rows: number;
}

const maps: ItemSize[] = [
	{ cols: 2, rows: 2 },
	{ cols: 1, rows: 1 },
	{ cols: 1, rows: 1 },
	{ cols: 2, rows: 1 },
	{ cols: 2, rows: 1 },
	{ cols: 1, rows: 1 },
	{ cols: 1, rows: 1 },
	{ cols: 2, rows: 2 }
];

const buildMaps =
	(map = [4, 2]) =>
	(count: number) => {
		const res: number[][] = [];
		let remain = map.concat();
		let isColSlice = true;
		let pickAfter = true;
		let i = 1;
		if (count === 1) return remain;
		while (i < count) {
			const [cols, rows] = remain;
			if (isColSlice) {
				res.push([cols / 2, rows]);
				isColSlice = !isColSlice;
				remain = [cols / 2, rows];
			} else {
				res.push([cols, rows / 2]);
				isColSlice = !isColSlice;
				remain = [cols, rows / 2];
			}
			i++;
			if (remain[0] === 1 && remain[1] === 1 && i < count) {
				remain = map.concat();
			}
		}
		res.push;
		return res;
	};

function buildMap(count: number) {
	const map = [4, 2];
	const res = [];
	let remain = map.concat();
	let isColSlice = true;
	let pickAfter = true;
	let i = 1;
	if (count === 1) return remain;
	while (i < count) {
		const [cols, rows] = remain;
		if (isColSlice) {
			res.push([cols / 2, rows]);
			isColSlice = !isColSlice;
			remain = [cols / 2, rows];
		} else {
			res.push([cols, rows / 2]);
			isColSlice = !isColSlice;
			remain = [cols, rows / 2];
		}
		i++;
		if (remain[0] === 1 && remain[1] === 1 && i < count) {
			res.push(remain);
			remain = map.concat();
		}
	}
	res.push(remain);
	return res;
}

const calculateColsAndRows = (index: number, maps: ItemSize[]) =>
	maps[index % 8];

export default ({ nodeView, images }: Props) => {
	const { $dom } = useNodeView(nodeView);
	images = images ?? [];

	const pending = (
		<MediaPendingBlock nodeView={nodeView}>添加图片</MediaPendingBlock>
	);
	const body = (
		<Menu content={<ImageTools />} placement="top-end">
			<ImageList variant="quilted">
				{images.map((item, index) => (
					<ImageListItem>
						<img loading="lazy" src={item.src} />
					</ImageListItem>
				))}
			</ImageList>
		</Menu>
	);

	return (
		<Tools>
			<div ref={$dom}>{images.length > 0 ? body : pending}</div>
		</Tools>
	);
};
