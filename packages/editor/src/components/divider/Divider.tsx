import Divider from '@mui/material/Divider';
import { useNodeView } from '../../utils/view';
import DividerView from './view';
import { Tools } from '../toolBar';
import { classnames } from '../../utils';

interface Props {
	nodeView: DividerView;
	selected?: boolean;
}
export default ({ nodeView, selected }: Props) => {
	const { $dom } = useNodeView(nodeView);
	return (
		<Tools placement="left">
			<div
				ref={$dom}
				className={classnames('divider', { selected })}
				style={{ padding: '12px 0' }}
			>
				<Divider />
			</div>
		</Tools>
	);
};
