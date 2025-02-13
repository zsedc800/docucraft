import { MediaPendingBlock } from '../../kits/PendingBlock';
import { useNodeView } from '../../utils/view';
import { VideoNodeView } from './view';
import './style.scss';
import Paper from '@mui/material/Paper';
import Tools from '../toolBar/Tools';

interface Props {
	nodeView: VideoNodeView;
	type: 'embed' | 'custom';
	src?: string;
	originSrc?: string;
	poster?: string;
}

export default ({ nodeView, type, src, poster }: Props) => {
	const { $dom } = useNodeView(nodeView);
	const body = (
		<div ref={$dom} className="video-container">
			{src ? (
				<Paper className="video-wrapper">
					{type === 'embed' ? (
						<iframe
							allowFullScreen
							src={src}
							frameBorder={0}
							sandbox="allow-scripts allow-popups allow-top-navigation-by-user-activation allow-forms allow-same-origin allow-storage-access-by-user-activation allow-popups-to-escape-sandbox"
						/>
					) : (
						<video src={src} controls poster={poster} />
					)}
				</Paper>
			) : (
				<MediaPendingBlock type="video" nodeView={nodeView}>
					添加视频
				</MediaPendingBlock>
			)}
		</div>
	);
	return <Tools>{body}</Tools>;
};
