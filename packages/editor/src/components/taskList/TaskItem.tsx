import { TaskItemView } from '.';
import { classnames } from '../../utils';
import { useNodeView } from '../../utils/view';
import Tools from '../toolBar/Tools';
interface Props {
	nodeView: TaskItemView;
	checked: boolean;
}
export default ({ nodeView, checked }: Props) => {
	const { $dom, $contentDOM } = useNodeView<HTMLLIElement, HTMLDivElement>(
		nodeView
	);
	return (
		<Tools>
			<li ref={$dom} className={classnames('task-item', { checked })}>
				<div className="task-item-checkbox" contentEditable={false}>
					<input
						type="checkbox"
						checked={checked}
						onChange={(e) => {
							const { view, getPos } = nodeView;
							const val = (e.target as HTMLInputElement)?.checked;
							let tr = view.state.tr;
							view.dispatch(
								tr.setNodeAttribute(getPos() as number, 'checked', !!val)
							);
						}}
					/>
				</div>
				<div ref={$contentDOM} className="task-item-content"></div>
			</li>
		</Tools>
	);
};
