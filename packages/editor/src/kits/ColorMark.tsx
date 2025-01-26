import Typography, { typographyClasses } from '@mui/material/Typography';
import Box from '@mui/material/Box';
import * as ColorBases from '@mui/material/colors';
import SvgArrowRight from '@docucraft/icons/svg/ArrowForwardIos';
import { NormalTooltip } from './Tooltip';
import { useEffect, useState } from '@docucraft/srender';
import { classnames } from '../utils';
import { Button, Divider } from '@mui/material';
import ColorPicker from './ColorPicker';
interface ColorProps {
	content?: string;
	color?: string;
	backgroundColor?: string;
	borderColor?: string;
	name?: string;
	onClick?: (e: any) => void;
	active?: boolean;
}
const ColorItem = ({
	content,
	color,
	backgroundColor,
	borderColor,
	name,
	onClick,
	active
}: ColorProps) => {
	return (
		<NormalTooltip title={name} disableInteractive placement="top">
			<div
				className={classnames('colorItem', { active })}
				style={{
					color,
					backgroundColor,
					borderColor: borderColor || color,
					borderStyle: 'solid',
					boxShadow: `${borderColor} 0px 0px 0px 1px inset`
				}}
				onClick={onClick}
			>
				{content}
			</div>
		</NormalTooltip>
	);
};

const { grey, ...others } = ColorBases;
const colorMap = {
	red: '红色',
	pink: '粉红色',
	orange: '橘黄色',
	deepOrange: '深橘色',
	yellow: '黄色',
	amber: '琥珀色',
	green: '绿色',
	lightGreen: '亮绿色',
	lime: '黄绿色',
	blue: '蓝色',
	lightBlue: '亮蓝色',
	cyan: '青色',
	teal: '蓝绿色',
	indigo: '靛青色',
	purple: '紫色',
	deepPurple: '深紫色',
	brown: '棕色',
	blueGrey: '蓝灰色'
};

const baseColors = Object.keys(colorMap).map((key) => ({
	name: (colorMap as any)[key],
	color: (others as any)[key][500],
	bgColor: (others as any)[key][50],
	borderColor: (others as any)[key][700]
}));

const textGrey = [
	'#000',
	grey[900],
	grey[700],
	grey[500],
	grey[300],
	grey[100]
].map((color, i) => ({
	color,
	name: `灰色 ${i + 1}`,
	bgColor: color,
	borderColor: grey[700]
}));
type ColorOpts = (typeof baseColors)[number];
type OnChange = (
	val: { bgColor?: string; color?: string },
	opts?: ColorOpts
) => void;
export default ({
	onChange,
	color,
	bgColor,
	onReset
}: {
	onChange?: OnChange;
	onReset?: () => void;
	color?: string;
	bgColor?: string;
}) => {
	const [state, setState] = useState({ color, bgColor });
	const handleChange = (value: typeof state, opts?: ColorOpts) => {
		onChange && onChange(value, opts);
		setState(value);
	};
	useEffect(() => {
		if (state.color !== color || state.bgColor !== bgColor)
			setState({ color, bgColor });
	}, [color, bgColor]);

	return (
		<Box
			sx={(t) => ({
				width: 240,
				paddingTop: '6px',
				[`& .${typographyClasses.h4}`]: {
					fontSize: 14,
					flexGrow: 1
				},
				'& .box': {
					padding: '6px 12px',
					'.header': {
						display: 'flex',
						alignItems: 'center',
						paddingBottom: '6px'
					},
					'.more': {
						fontSize: 12,
						display: 'flex',
						alignItems: 'center',
						flexShrink: 0,
						cursor: 'pointer'
					}
				},
				'& .colorItem': {
					display: 'inline-flex',
					borderRadius: '5px',
					width: '24px',
					height: '24px',
					boxSizing: 'border-box',
					justifyContent: 'center',
					alignItems: 'center',
					cursor: 'pointer',
					borderWidth: 0,
					'&:hover': {
						borderWidth: '1px'
					},
					'&.active': {
						borderWidth: '1px'
					}
				},
				'& .colorList': {
					display: 'grid',
					gridTemplateColumns: 'repeat(6, 1fr)',
					gap: '10px'
				},
				'& .footer': {
					display: 'flex',
					justifyContent: 'flex-end',
					padding: '6px 10px'
				}
			})}
		>
			<div className="box">
				<div className="header">
					<Typography variant="h4">文本颜色</Typography>
					<ColorPicker
						value={state.color}
						onChange={(color) => handleChange({ ...state, color })}
					>
						<div className="more">
							更多颜色
							<SvgArrowRight />
						</div>
					</ColorPicker>
				</div>
				<div className="colorList">
					{textGrey
						.concat(baseColors)
						.map(({ color, name, borderColor, ...rest }) => (
							<ColorItem
								color={color}
								content="A"
								name={name}
								borderColor={borderColor}
								active={color === state.color}
								onClick={() =>
									handleChange(
										{ ...state, color },
										{ color, name, borderColor, ...rest }
									)
								}
							/>
						))}
				</div>
			</div>
			<div className="box">
				<div className="header">
					<Typography variant="h4">背景颜色</Typography>
					<ColorPicker
						value={state.bgColor}
						onChange={(bgColor) => handleChange({ ...state, bgColor })}
					>
						<div className="more">
							更多颜色
							<SvgArrowRight />
						</div>
					</ColorPicker>
				</div>
				<div className="colorList">
					{baseColors.map(({ bgColor, name, borderColor, ...rest }) => (
						<ColorItem
							name={name}
							borderColor={borderColor}
							backgroundColor={bgColor}
							active={bgColor === state.bgColor}
							onClick={() =>
								handleChange(
									{ ...state, bgColor },
									{ bgColor, name, borderColor, ...rest }
								)
							}
						/>
					))}
				</div>
			</div>
			<Divider />
			<div className="footer">
				<Button
					onClick={() => {
						// setState({color});
						onReset && onReset();
					}}
				>
					取消设置
				</Button>
			</div>
		</Box>
	);
};

export const BaseColorMark = ({
	onChange,
	extra = [],
	title
}: {
	title: string;
	onChange?: (v: string, opts?: ColorOpts) => void;
	extra?: ColorOpts[];
}) => {
	const handleChange = (color: string, opts?: ColorOpts) => {
		onChange && onChange(color, opts);
	};
	const [color, setColor] = useState('');
	const colors = baseColors.concat(extra);
	return (
		<Box
			className="box"
			sx={{
				padding: '6px 12px',
				[`& .${typographyClasses.h4}`]: {
					fontSize: 14,
					flexGrow: 1
				},
				'& .header': {
					display: 'flex',
					alignItems: 'center',
					paddingBottom: '6px'
				},
				'& .more': {
					fontSize: 12,
					display: 'flex',
					alignItems: 'center',
					flexShrink: 0,
					cursor: 'pointer'
				},
				'& .colorItem': {
					display: 'inline-flex',
					borderRadius: '5px',
					width: '24px',
					height: '24px',
					boxSizing: 'border-box',
					justifyContent: 'center',
					alignItems: 'center',
					cursor: 'pointer',
					borderWidth: 0,
					'&:hover': {
						borderWidth: '1px'
					},
					'&.active': {
						borderWidth: '1px'
					}
				},
				'& .colorList': {
					display: 'grid',
					gridTemplateColumns: 'repeat(6, 1fr)',
					gap: '10px'
				}
			}}
		>
			<div className="header">
				<Typography variant="h4">{title}</Typography>
				<ColorPicker
					value={color}
					onChange={(bgColor) => handleChange(bgColor)}
				>
					<div className="more">
						更多颜色
						<SvgArrowRight />
					</div>
				</ColorPicker>
			</div>
			<div className="colorList">
				{colors.map(({ bgColor, name, borderColor, ...rest }) => (
					<ColorItem
						name={name}
						borderColor={borderColor}
						backgroundColor={bgColor}
						active={bgColor === color}
						onClick={() =>
							handleChange(bgColor, { bgColor, name, borderColor, ...rest })
						}
					/>
				))}
			</div>
		</Box>
	);
};
