import Icon from '@docucraft/icons';
import { useNodeView } from '../../utils/view';
import Tools from '../toolBar/Tools';
import { EmphasisView } from './view';
import { IconPicker, PickerValue } from '../../kits/Picker';
import './style.scss';

interface Props {
	nodeView: EmphasisView;
	icon: PickerValue;
}
export default ({ nodeView, icon }: Props) => {
	const { $dom, $contentDOM } = useNodeView(nodeView);
	const body = (
		<div ref={$dom} className="emphasis-block">
			<div className="emphasis-block-icon" contentEditable={false}>
				<IconPicker
					onChange={(v) => nodeView.setNodeAttribute('icon', v)}
					style={{
						width: 24,
						height: 24,
						justifyContent: 'center',
						lineHeight: 1,
						fontSize: 16,
						padding: '3px'
					}}
				>
					{icon.type === 'icon' ? (
						<Icon name={icon.value as any} color={icon.color} />
					) : (
						icon.value
					)}
				</IconPicker>
			</div>
			<div ref={$contentDOM} className="emphasis-block-content" />
		</div>
	);
	return <Tools>{body}</Tools>;
};
