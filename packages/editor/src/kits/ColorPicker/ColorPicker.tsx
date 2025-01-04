import { ReactNode, useEffect, useRef, useState } from '@docucraft/srender';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import { useEvent } from '../../utils/hooks';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import {
	formatHex,
	hslToRgb,
	parseColorToRgba,
	rgbToHex,
	rgbToHsl
} from './utils';
import { SubMenu } from '../Menu';

export interface ColorPickerProps {
	defaultValue?: string;
	onChange?: (color: string, context?: ColorContext) => void;
	value?: string;
	disabledAlpha?: boolean;
}

const ColorSlider = styled(Slider)({
	color: '#52af77',
	height: 8,
	display: 'block',
	padding: '6px 0',
	'& .MuiSlider-track': {
		border: 'none',
		backgroundColor: 'transparent'
	},
	'& .MuiSlider-rail': {
		background:
			'linear-gradient(90deg, rgb(255, 0, 0) 0%, rgb(255, 255, 0) 17%, rgb(0, 255, 0) 33%, rgb(0, 255, 255) 50%, rgb(0, 0, 255) 67%, rgb(255, 0, 255) 83%, rgb(255, 0, 0) 100%)'
	},
	'& .MuiSlider-thumb': {
		height: 8,
		width: 8,
		border: '2px solid #fff',
		boxShadow: 'inset 0 0 1px 0 rgba(0,0,0,0.25),0 0 0 1px rgba(0,0,0,0.06)',
		boxSizing: 'content-box',
		backgroundColor: 'currentColor',
		'&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
			boxShadow: 'inherit'
		},
		'&.Mui-active, &:hover': {
			'&::before': {
				boxShadow: 'inset 0 0 1px 0 rgba(0,0,0,0.25),0 0 0 1px rgba(0,0,0,0.06)'
			}
		},
		'&::before': {
			// display: 'none'
			width: '200%',
			height: '200%',
			boxShadow: 'none'
		},
		'&::after': {
			width: 32,
			height: 32
		}
	}
});

const MiniTextField = styled(TextField)((t) => ({
	paddingRight: 0,
	'& .MuiInputBase-input, & .MuiInputLabel-root, & .MuiInputBase-root': {
		fontWeight: 'normal',
		lineHeight: 1.25,
		fontSize: '12px',
		padding: '2px',
		textAlign: 'center'
	},
	'& input::-webkit-outer-spin-button,input::-webkit-inner-spin-button': {
		appearance: 'none'
	}
}));

class ColorContext {
	constructor(public value: [number, number, number, number]) {}
	toHex = () => {
		const [r, g, b] = this.value;
		return rgbToHex(r, g, b);
	};
	toHsl = () => {
		const [r, g, b] = this.value;
		return rgbToHsl(r, g, b);
	};
	toRgb = () => {
		const [r, g, b] = this.value;
		return `rgb(${r}, ${g}, ${b})`;
	};
	toRgba = () => {
		const [r, g, b, a] = this.value;
		return `rgba(${r}, ${g}, ${b}, ${a})`;
	};
}

export const ColorPickerPanel = ({
	defaultValue = '#FF0000',
	onChange,
	value,
	disabledAlpha
}: ColorPickerProps) => {
	const [r1, g1, b1, a1] = parseColorToRgba(value || defaultValue);
	const [hueColor, setHueColor] = useState(rgbToHex(r1, g1, b1));
	let [rgba, setColor] = useState({ r: r1, g: g1, b: b1, a: a1 });

	const isControlled = value && typeof onChange === 'function';
	if (isControlled) rgba = { r: r1, g: g1, b: b1, a: a1 };

	const { r, g, b, a: alpha } = rgba;

	const [hue, saturation, lightness] = rgbToHsl(r, g, b);

	const [formatType, setFmtType] = useState(0);

	const color = `rgba(${r}, ${g}, ${b}, ${alpha})`;
	const hex = rgbToHex(r, g, b);
	const hsl = { h: hue, s: saturation, l: lightness };

	const setRgba = useEvent((color: typeof rgba) => {
		const { r, g, b, a } = color;
		if (typeof onChange === 'function') {
			onChange(`rgba(${r}, ${g}, ${b}, ${a})`, new ColorContext([r, g, b, a]));
			if (!value) setColor(color);
		} else setColor(color);
	});

	const handleHueChange = (event: Event, val: number | number[]) => {
		const [r, g, b] = hslToRgb(val as number, saturation, lightness);
		setRgba({ r, g, b, a: alpha });
		setHueColor(rgbToHex(r, g, b));
	};

	const handleSaturationLightnessChange = (s: number, l: number) => {
		const [r, g, b] = hslToRgb(hue, s, l);
		setRgba({ r, g, b, a: alpha });
	};

	const handleMousePick = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const s = Math.min(
			100,
			Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)
		);
		const l = Math.min(
			100,
			Math.max(0, (1 - (e.clientY - rect.top) / rect.height) * 100)
		);
		handleSaturationLightnessChange(s, l);
	};

	const handleAlphaChange = (event: Event, val: number | number[]) => {
		setRgba({ r, g, b, a: val as number });
	};

	const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newHex = e.target.value;
		const [r, g, b, a] = parseColorToRgba(formatHex(newHex));
		setRgba({ r, g, b, a });
	};

	const handleRgbChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
		channel: 'r' | 'g' | 'b'
	) => {
		const value = Math.max(0, Math.min(255, Number(e.target.value)));
		const rgba = { r, g, b, a: alpha };
		rgba[channel] = value;
		setRgba(rgba);
	};
	return (
		<Box
			display="flex"
			flexDirection="column"
			alignItems="center"
			gap={1}
			padding={1}
		>
			{/* 饱和度/亮度面板 */}
			<Box
				sx={{
					width: '100%',
					height: 165,
					background: `hsl(${hue}, 100%, 50%)`,
					position: 'relative',
					cursor: 'crosshair',
					borderRadius: '4px',
					border: '1px solid #f3f4f5',
					backgroundImage:
						'linear-gradient(to right, #fff, rgba(255,255,255,0)), linear-gradient(to top, #000, rgba(0,0,0,0))'
				}}
				onMouseDown={(e) => handleMousePick(e)}
				onMouseMove={(e) => e.buttons === 1 && handleMousePick(e)}
			>
				{/* 选取滑块 */}
				<Box
					sx={{
						position: 'absolute',
						top: `${100 - lightness}%`,
						left: `${saturation}%`,
						width: 12,
						height: 12,
						borderRadius: '50%',
						border: '2px solid #fff',
						backgroundColor: 'transparent',
						transform: 'translate(-50%, -50%)'
					}}
				/>
			</Box>
			<Box display="flex" width="100%" alignItems="center" gap={1}>
				<Box flexGrow={1}>
					{/* 色相滑块 */}
					<ColorSlider
						value={hue}
						onChange={handleHueChange}
						min={0}
						max={359}
						style={{ color: hueColor }}
						aria-labelledby="hue-slider"
					/>
					{/* 不透明度滑块 */}
					{!disabledAlpha && (
						<ColorSlider
							value={alpha}
							onChange={handleAlphaChange}
							min={0}
							max={1}
							step={0.01}
							aria-labelledby="alpha-slider"
							style={{
								color
							}}
							slotProps={{
								rail: {
									style: {
										background: `linear-gradient(90deg, rgba(${r}, ${g}, ${b}, 0) 0%, rgb(${r}, ${g}, ${b}) 100%)`
									}
								}
							}}
							sx={{
								backgroundSize: '8px 8px',
								margin: '6px 0',
								padding: '0',
								backgroundImage:
									'conic-gradient(rgba(0, 0, 0, 0.06) 0 25%, transparent 0 50%, rgba(0, 0, 0, 0.06) 0 75%, transparent 0)'
							}}
						/>
					)}
				</Box>
				{/* 颜色预览 */}
				<Box
					style={{
						color
					}}
					sx={{
						backgroundImage:
							'conic-gradient(rgba(0, 0, 0, 0.06) 0 25%, transparent 0 50%, rgba(0, 0, 0, 0.06) 0 75%, transparent 0)',
						backgroundSize: '50% 50%',
						width: 30,
						height: 30,
						borderRadius: 4,
						overflow: 'hidden',
						flexShrink: 0,
						'&::after': {
							content: "''",
							width: '100%',
							height: '100%',
							display: 'block',
							backgroundColor: 'currentColor'
						}
					}}
				/>
			</Box>
			<Box display="flex" width="100%" gap={1}>
				<MiniTextField
					select
					value={formatType}
					slotProps={{
						select: {
							native: true
						}
					}}
					onChange={(e) => setFmtType(parseInt(e.target.value))}
					sx={{ width: 70, flexShrink: 0 }}
				>
					<option value={0}>HEX</option>
					<option value={1}>RGB</option>
					<option value={2}>HSL</option>
				</MiniTextField>
				<Box flexGrow={1} display="flex" justifyContent="center" gap={1}>
					{formatType === 0 ? (
						<OutlinedInput
							key="hex"
							value={hex}
							onChange={handleHexChange}
							slotProps={{ input: { maxLength: 7 } }}
							sx={{
								maxWidth: 128,
								'& .MuiInputBase-input': {
									padding: '2px',
									fontSize: '12px',
									lineHeight: 1.25,
									textAlign: 'center'
								}
							}}
						/>
					) : formatType === 1 ? (
						(['r', 'g', 'b'] as const).map((channel) => (
							<MiniTextField
								key={channel}
								label={channel.toUpperCase()}
								value={rgba[channel]}
								onChange={(e) => handleRgbChange(e, channel)}
								slotProps={{
									htmlInput: {
										type: 'number',
										min: 0,
										max: 255,
										maxLength: 3
									}
								}}
								sx={{ width: 36 }}
							/>
						))
					) : formatType === 2 ? (
						(['h', 's', 'l'] as const).map((channel, i) => (
							<MiniTextField
								key={channel}
								label={channel.toUpperCase()}
								value={hsl[channel]}
								slotProps={{
									htmlInput: {
										type: 'number',
										maxLength: 3,
										...(i > 0 ? { min: 0, max: 100 } : void 0)
									},
									input: {
										...(i > 0
											? {
													endAdornment: (
														<InputAdornment
															style={{ margin: 0 }}
															position="end"
														>
															%
														</InputAdornment>
													)
												}
											: void 0)
									}
								}}
								sx={{ width: 40 }}
							/>
						))
					) : null}
				</Box>
				<MiniTextField
					size="small"
					label="A"
					value={Math.round(alpha * 100)}
					slotProps={{
						htmlInput: { type: 'number', min: 0, max: 100, maxLength: 3 },
						input: {
							endAdornment: (
								<InputAdornment style={{ margin: 0 }} position="end">
									%
								</InputAdornment>
							)
						}
					}}
					style={{ flexShrink: 0 }}
					sx={{ width: 40 }}
				/>
			</Box>
		</Box>
	);
};

export default ({
	onChange,
	children,
	value,
	defaultValue
}: {
	onChange?: ColorPickerProps['onChange'];
	children: ReactNode;
	value?: string;
	defaultValue?: string;
}) => {
	const [color, setColor] = useState('#ff0000');
	const instance = useRef<{ close: () => void }>(null);

	return (
		// @ts-ignore
		<SubMenu
			ref={instance}
			slotProps={{ paper: { sx: { margin: '0 15px' } } }}
			content={
				<Box>
					<ColorPickerPanel
						defaultValue={defaultValue}
						value={color}
						onChange={setColor}
					/>
					<Divider />
					<Box display="flex" justifyContent="flex-end">
						<Button
							size="small"
							onClick={() => {
								onChange && onChange(color);
								instance.current?.close();
							}}
						>
							确定
						</Button>
						<Button size="small" onClick={instance.current?.close}>
							取消
						</Button>
					</Box>
				</Box>
			}
		>
			{children}
		</SubMenu>
	);
};
