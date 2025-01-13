import SvgImage from '@docucraft/icons/svg/ImagesmodeFill';
import SvgVideo from '@docucraft/icons/svg/MovieFill';
import SvgAudio from '@docucraft/icons/svg/MicFill';
import { ReactNode, forwardRef } from '@docucraft/srender';
import Menu from '../Menu';
import { BaseNodeView } from '../../utils/view';
import { ImageUploader } from '../Uploader';
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
			<Menu content={<ImageUploader nodeView={nodeView} />} placement="bottom">
				<div ref={ref} className="pending-block">
					<Icon className="icon" />
					{children}
				</div>
			</Menu>
		);
	}
);
