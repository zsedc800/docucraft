import Divider from '@mui/material/Divider';
import { useNodeView } from '../../utils/view';
import DividerView from './view';

interface Props {
	nodeView: DividerView;
}
export default ({ nodeView }: Props) => {
	const { $contentDOM, $dom } = useNodeView(nodeView);
	return (
		<div ref={$dom} className="divider" style={{ padding: '12px 0' }}>
			<Divider />
		</div>
	);
};
