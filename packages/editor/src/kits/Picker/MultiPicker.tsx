import { ReactNode, useRef } from '@docucraft/srender';
import Tabs, { TabChild } from '../Tabs';
import { ToggleButton, ToggleButtonInstance } from '../ToggleButton';
import { EmojiPickerPanel } from './EmojiPicker';
import { IconPickerPanel } from './IconPicker';
import { EmojiItem, IconInfo, PickerValue, SelectedType } from './interface';
import { BaseProps } from '../../interface';

interface Props {
	children?: ReactNode;
	onChange?: (e: PickerValue) => void;
}

export default ({ children, onChange, ...attrs }: BaseProps<Props>) => {
	const panelCtx = useRef<ToggleButtonInstance>(null);
	const handleChange = (type: SelectedType) => (e: IconInfo | EmojiItem) => {
		const data = {
			type,
			value: type === 'emoji' ? (e as EmojiItem).native : (e as IconInfo).name,
			color: (e as IconInfo).color,
			detail: e
		};
		onChange && onChange(data);
		panelCtx.current?.close();
	};

	const panel = (
		<Tabs align="center" defaultValue={1} dense>
			<TabChild label="图标库" value={1}>
				<IconPickerPanel onChange={handleChange('icon')} />
			</TabChild>
			<TabChild label="表情库" value={2}>
				<EmojiPickerPanel
					pickerOptions={{
						onEmojiSelect: handleChange('emoji')
					}}
				/>
			</TabChild>
		</Tabs>
	);

	return (
		<ToggleButton
			ref={panelCtx}
			{...attrs}
			subPanel={panel}
			slotProps={{ paper: { style: { borderRadius: 5 } } }}
			IconComponent={() => null}
		>
			{children}
		</ToggleButton>
	);
};
