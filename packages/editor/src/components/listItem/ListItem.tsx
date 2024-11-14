import Tooltip from '@mui/material/Tooltip';
import { useNodeView } from '../../utils/view';
import Tools from '../toolBar/Tools';
import { ListItemView } from './view';

interface Props {
	nodeView: ListItemView;
}
export default ({ nodeView }: Props) => {
	const { $dom, $contentDOM } = useNodeView<HTMLLIElement>(nodeView);
	return (
		<Tools>
			<li ref={$dom} className="list-item">
				<div className="marker"></div>
				<div className="list-item-content" ref={$contentDOM}></div>
			</li>
		</Tools>
	);
};
