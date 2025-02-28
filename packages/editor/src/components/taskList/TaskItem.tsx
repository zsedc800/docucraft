import { TaskItemView } from './view';
import { ColorPalette } from '../../kits/Button/OPMenus';
import { classnames } from '../../utils';
import { BaseNodeViewProps, useNodeView } from '../../utils/view';
import Tools from '../toolBar/Tools';
interface Props extends BaseNodeViewProps {
	nodeView: TaskItemView;
	checked: boolean;
}
export default ({ nodeView, checked, selected, color, bgColor }: Props) => {
	const { $dom, $contentDOM } = useNodeView<HTMLLIElement, HTMLDivElement>(
		nodeView
	);
	return (
		<Tools style={{ paddingTop: 3 }} extraMenu={ColorPalette}>
			<li
				ref={$dom}
				style={{ color, backgroundColor: bgColor }}
				className={classnames('task-item', { checked, selected })}
			>
				<div className="task-item-checkbox" contentEditable={false}>
					<input
						type="checkbox"
						checked={checked}
						onChange={(e) => {
							const val = (e.target as HTMLInputElement)?.checked;
							nodeView.setNodeAttribute('checked', !!val);
						}}
					/>
				</div>
				<div ref={$contentDOM} className="task-item-content"></div>
			</li>
		</Tools>
	);
};
