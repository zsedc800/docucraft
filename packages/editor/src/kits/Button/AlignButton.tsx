import { ToggleButton, ToggleButtonGroup, Trigger } from '../ToggleButton';
import SvgFormatAlignLeft from '@docucraft/icons/svg/FormatAlignLeft';
import SvgFormatAlignCenter from '@docucraft/icons/svg/FormatAlignCenter';
import SvgFormatAlignRight from '@docucraft/icons/svg/FormatAlignRight';
import SvgFormatAlignJustify from '@docucraft/icons/svg/FormatAlignJustify';
import { CSSProperties } from 'react';
import { useState } from '@docucraft/srender';
// import SvgFormat from '@docucraft/icons/svg/FormatAlignLeft';
export type Align = 'left' | 'center' | 'right' | 'justify';
interface Props {
	align?: Align;
	onChange?: (a: Align) => void;
	style?: CSSProperties;
	closePanel?: boolean;
	trigger?: Trigger;
}

const AlignMap = {
	left: SvgFormatAlignLeft,
	center: SvgFormatAlignCenter,
	right: SvgFormatAlignRight,
	justify: SvgFormatAlignJustify
};

export default ({ onChange, style, closePanel, trigger }: Props) => {
	const [align, setAlign] = useState<Align>('left');
	const Icon = AlignMap[align];
	const subPanel = (
		<ToggleButtonGroup
			style={{ fontSize: style && style.fontSize }}
			onChange={(v) => {
				setAlign(v);
				onChange && onChange(v);
			}}
			value={align}
		>
			<ToggleButton
				title={
					<>
						左对齐
						<br />
						<span
							style={{ opacity: 0.5 }}
							dangerouslySetInnerHTML={{ __html: 'Ctrl+&#8657+L' }}
						/>
					</>
				}
				value="left"
			>
				<SvgFormatAlignLeft />
			</ToggleButton>
			<ToggleButton
				title={
					<>
						居中对齐
						<br />
						<span
							style={{ opacity: 0.5 }}
							dangerouslySetInnerHTML={{ __html: 'Ctrl+&#8657+C' }}
						/>
					</>
				}
				value="center"
			>
				<SvgFormatAlignCenter />
			</ToggleButton>
			<ToggleButton
				title={
					<>
						右对齐
						<br />
						<span
							style={{ opacity: 0.5 }}
							dangerouslySetInnerHTML={{ __html: 'Ctrl+&#8657+R' }}
						/>
					</>
				}
				value="right"
			>
				<SvgFormatAlignRight />
			</ToggleButton>
			<ToggleButton
				title={
					<>
						两端对齐
						<br />
						<span
							style={{ opacity: 0.5 }}
							dangerouslySetInnerHTML={{ __html: 'Ctrl+&#8657+J' }}
						/>
					</>
				}
				value="justify"
			>
				<SvgFormatAlignJustify />
			</ToggleButton>
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
