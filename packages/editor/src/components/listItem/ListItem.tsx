import { classnames } from '../../utils';
import { useNodeView } from '../../utils/view';
import Tools from '../toolBar/Tools';
import { ListItemView } from './view';

interface Props {
	nodeView: ListItemView;
	hasSublist: boolean;
}
export default ({ nodeView, hasSublist = false }: Props) => {
	const { $dom, $contentDOM } = useNodeView<HTMLLIElement>(nodeView);

	return (
		<Tools visible={hasSublist ? false : void 0}>
			<li
				ref={$dom}
				className={classnames('list-item', {
					hasSublist,
					inlist: nodeView.inlist
				})}
			>
				{hasSublist ? <></> : <div className="marker"></div>}
				<div className="list-item-content" ref={$contentDOM}></div>
			</li>
		</Tools>
	);
};
