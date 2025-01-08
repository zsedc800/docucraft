import { ToggleButton, ToggleButtonGroup, Trigger } from '../ToggleButton';
import SvgFormatAlignLeft from '@docucraft/icons/svg/FormatAlignLeft';
import SvgFormatAlignCenter from '@docucraft/icons/svg/FormatAlignCenter';
import SvgFormatAlignRight from '@docucraft/icons/svg/FormatAlignRight';
import SvgFormatAlignJustify from '@docucraft/icons/svg/FormatAlignJustify';
import { CSSProperties, useEffect } from 'react';
import { useState } from '@docucraft/srender';
// import SvgFormat from '@docucraft/icons/svg/FormatAlignLeft';
export type Align = 'left' | 'center' | 'right' | 'justify';

const alignMap = {
	left: SvgFormatAlignLeft,
	center: SvgFormatAlignCenter,
	right: SvgFormatAlignRight,
	justify: SvgFormatAlignJustify
};

const alignItems = [
	{
		align: 'left',
		Icon: SvgFormatAlignLeft,
		title: '左对齐',
		command: 'Ctrl+&#8657+L'
	},
	{
		align: 'center',
		Icon: SvgFormatAlignCenter,
		title: '居中对齐',
		command: 'Ctrl+&#8657+C'
	},
	{
		align: 'right',
		Icon: SvgFormatAlignRight,
		title: '右对齐',
		command: 'Ctrl+&#8657+R'
	},
	{
		align: 'justify',
		Icon: SvgFormatAlignJustify,
		title: '两端对齐',
		command: 'Ctrl+&#8657+J'
	}
];

interface Props {
	align?: Align;
	onChange?: (a: Align) => void;
	style?: CSSProperties;
	closePanel?: boolean;
	trigger?: Trigger;
	filter?: (item: (typeof alignItems)[number]) => boolean;
}

export default ({
	onChange,
	style,
	closePanel,
	trigger,
	align: value,
	filter
}: Props) => {
	const [align, setAlign] = useState<Align>('left');
	const Icon = alignMap[align];
	let items = alignItems;
	if (filter) items = items.filter(filter);
	useEffect(() => {
		if (value && value !== align) setAlign(value);
	}, [value]);
	const subPanel = (
		<ToggleButtonGroup
			style={{ fontSize: style && style.fontSize }}
			onChange={(v) => {
				setAlign(v);
				onChange && onChange(v);
			}}
			value={align}
		>
			{items.map(({ title, Icon, command, align }) => (
				<ToggleButton
					title={
						<>
							{title}
							<br />
							<span
								style={{ opacity: 0.5 }}
								dangerouslySetInnerHTML={{ __html: command }}
							/>
						</>
					}
					value={align}
				>
					<Icon />
				</ToggleButton>
			))}
		</ToggleButtonGroup>
	);
	return (
		<ToggleButton
			title="对齐方式"
			style={style}
			subPanel={closePanel ? null : subPanel}
			trigger={trigger}
			placement="top"
		>
			<Icon />
		</ToggleButton>
	);
};
