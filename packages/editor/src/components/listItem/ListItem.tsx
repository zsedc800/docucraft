import { ColorPalette } from '../../kits/Button/OPMenus';
import { classnames } from '../../utils';
import { BaseNodeViewProps, useNodeView } from '../../utils/view';
import Tools from '../toolBar/Tools';
import { ListItemView } from './view';

interface Props extends BaseNodeViewProps {
	nodeView: ListItemView;
	hasSublist: boolean;
}
export default ({
	nodeView,
	hasSublist = false,
	selected,
	color,
	bgColor
}: Props) => {
	const { $dom, $contentDOM } = useNodeView<HTMLLIElement>(nodeView);
	const isToplevel = nodeView.depth === 1;
	const body = (
		<li
			ref={$dom}
			style={{ color, backgroundColor: bgColor }}
			className={classnames('list-item', {
				hasSublist,
				inlist: nodeView.inlist,
				selected
			})}
		>
			{hasSublist ? <></> : <div className="marker"></div>}
			<div className="list-item-content" ref={$contentDOM}></div>
		</li>
	);
	return isToplevel ? (
		<Tools
			style={{ paddingTop: 3 }}
			visible={hasSublist ? false : void 0}
			extraMenu={ColorPalette}
		>
			{body}
		</Tools>
	) : (
		body
	);
};
