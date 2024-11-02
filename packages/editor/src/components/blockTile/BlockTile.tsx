import { useNodeView } from '../../utils/view';
import { BlockTileView } from './view';
interface Props {
	nodeView: BlockTileView;
}
export default ({ nodeView }: Props) => {
	const { $dom } = useNodeView<HTMLDivElement, HTMLDivElement>(nodeView);
	return <div ref={$dom} className="blockTile" />;
};
