import SvgImage from '@docucraft/icons/svg/ImagesmodeFill';
import SvgVideo from '@docucraft/icons/svg/MovieFill';
import SvgAudio from '@docucraft/icons/svg/MicFill';
import { ReactNode, forwardRef } from '@docucraft/srender';
import Menu from '../Menu';
import { BaseNodeView } from '../../utils/view';
import { AudioUploader, ImageUploader, VideoUploader } from '../Uploader';

function chain<T>(...fns: ((...args: any[]) => false | T)[]) {
	return (...args: any[]) => {
		for (const fn of fns) {
			const res = fn(...args);
			if (res) return res;
		}
		return false;
	};
}

const handleSource = chain(
	(src) => {
		const reg =
			/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch[^?&]*[?&]v=|youtu\.be\/)([\w-]+)/;
		const match = reg.exec(src);
		if (match) return `https://www.youtube.com/embed/${match[1]}`;

		return false;
	},
	(src) => {
		const reg = /(?:https?:\/\/)?(?:www\.)?bilibili\.com\/video\/([\w]+)/;
		const match = reg.exec(src);
		if (match)
			return `https://player.bilibili.com/player.html?bvid=${match[1]}&autoplay=0&muted=0`;
		return false;
	}
);

function handleVideoSource(src: string) {
	return handleSource(src) ?? src;
}

export type MediaType = 'image' | 'audio' | 'video';
interface Props {
	type?: MediaType;
	children?: ReactNode;
	nodeView: BaseNodeView;
}
const IconMap: Record<MediaType, (...args: any[]) => ReactNode> = {
	image: SvgImage,
	audio: SvgAudio,
	video: SvgVideo
};
export default forwardRef<HTMLDivElement, Props>(
	({ type = 'image', children, nodeView }, ref) => {
		const Icon = IconMap[type];
		return (
			<Menu
				content={
					type === 'image' ? (
						<ImageUploader
							onChange={(img) =>
								nodeView.setNodeAttribute(
									'src',
									nodeView.node.type.name === 'imageGallery' ? img : img.src
								)
							}
						/>
					) : type === 'video' ? (
						<VideoUploader
							onChange={(src) =>
								nodeView.setNodeAttributes({
									src: handleSource(src),
									type: 'embed'
								})
							}
						/>
					) : type === 'audio' ? (
						<AudioUploader
							onChange={(src) => nodeView.setNodeAttribute('src', src)}
						/>
					) : null
				}
				placement="bottom"
			>
				<div ref={ref} className="pending-block">
					<Icon className="icon" />
					{children}
				</div>
			</Menu>
		);
	}
);
