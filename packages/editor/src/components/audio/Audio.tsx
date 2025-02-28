import { useEffect } from '@docucraft/srender';
import { MediaPendingBlock } from '../../kits/PendingBlock';
import { AudioNodeView } from './view';
import { useNodeView } from '../../utils/view';
import './style.scss';
import Tools from '../toolBar/Tools';
import { classnames } from '../../utils';

interface Props {
	src: string;
	nodeView: AudioNodeView;
}

export default ({ src, nodeView }: Props) => {
	useEffect(() => {}, []);
	const { $dom } = useNodeView(nodeView);
	const body = (
		<div ref={$dom} className={classnames('audio-container')}>
			{src ? (
				<audio src={src} preload="auto" controls></audio>
			) : (
				<MediaPendingBlock type="audio" nodeView={nodeView}>
					添加音频
				</MediaPendingBlock>
			)}
		</div>
	);

	return <Tools>{body}</Tools>;
};
