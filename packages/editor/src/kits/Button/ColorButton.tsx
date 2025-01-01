import { styled } from '@mui/material/styles';
import SvgArrowDown from '@docucraft/icons/svg/StatMinus1';
import { ToggleButton, Trigger } from '../ToggleButton';
import ColorMark from '../ColorMark';
import { useState } from '@docucraft/srender';
const IconA = styled('span')(() => ({
	padding: '0 6px',
	borderRadius: '4px',
	border: '1px solid #f3f4f5'
}));

interface Colors {
	color?: string;
	backgroundColor?: string;
}

interface Props {
	closePanel?: boolean;
	onChange?: (e: Colors) => void;
	trigger?: Trigger;
}

export default ({ closePanel, onChange, trigger }: Props) => {
	const [{ color, backgroundColor }, setColors] = useState<Colors>({});
	return (
		<ToggleButton
			trigger={trigger}
			subPanel={
				closePanel ? null : (
					<ColorMark
						color={color}
						bgColor={backgroundColor}
						onReset={() => {
							setColors({ color: '', backgroundColor: '' });
							onChange && onChange({ color: '', backgroundColor: '' });
						}}
						onChange={({ color, bgColor: backgroundColor }) => {
							setColors({ color, backgroundColor });
							onChange && onChange({ color, backgroundColor });
						}}
					/>
				)
			}
			IconComponent={SvgArrowDown}
		>
			<IconA style={{ color, backgroundColor }}>A</IconA>
		</ToggleButton>
	);
};
