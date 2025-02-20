import { useNodeView } from '../../utils/view';
import Tools from '../toolBar/Tools';
import { EmphasisView } from './view';

interface Props {
	nodeView: EmphasisView;
}
export default ({ nodeView }: Props) => {
	const { $dom } = useNodeView(nodeView);
	const body = <div ref={$dom} className="emphasis-block"></div>;
	return <Tools>{body}</Tools>;
};
