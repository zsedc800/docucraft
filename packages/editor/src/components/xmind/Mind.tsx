import { useEffect } from '@docucraft/srender';
import { Leafer, Rect } from 'leafer-ui';
import { BaseNodeViewProps, useNodeView } from '../../utils/view';
import { XMindView } from './view';

interface Props extends BaseNodeViewProps {
	nodeView: XMindView;
	blockId: string;
}
export default ({ nodeView, blockId }: Props) => {
	const { $dom } = useNodeView(nodeView);
	useEffect(() => {
		const leafer = new Leafer({ view: blockId });
		leafer.add(
			new Rect({ width: 200, height: 200, fill: '#32cd79', draggable: true })
		);
		return () => {
			leafer.destroy();
		};
	}, []);
	return (
		<div id={blockId} className="xmind" style={{ height: 500 }} ref={$dom} />
	);
};
