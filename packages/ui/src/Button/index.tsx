import Icon, { IconName } from '@docucraft/icons';
import { BasicType, ElementProps, Option } from '../interfaces';
import { MouseEvent, useEffect, useState } from 'react';
import './style';

interface Props extends ElementProps {
	disabled?: boolean;
	text?: string;
	type?:
		| 'elevated'
		| 'filled'
		| 'filled-tonal'
		| 'outlined'
		| 'text'
		| 'segment'
		| 'fab'
		| 'extended-fab';
	icon?: IconName;
	onClick?: (e: MouseEvent) => void;
}

const Button = ({
	text,
	children,
	type,
	icon,
	style,
	className,
	disabled,
	onClick
}: Props) => {
	return (
		<button
			onClick={(e) => {
				!disabled && onClick && onClick(e);
			}}
			style={style}
			className={`dUI-button${type ? ' dUI-button--' + type : ''}${className ? ' ' + className : ''}${disabled ? ' disabled' : ''}`}
		>
			{icon ? <Icon name={icon} /> : null}
			<span className="dUI-button__label">{text || children}</span>
		</button>
	);
};

export const Group = ({ children, style, className }: ElementProps) => {
	return (
		<div style={style} className={`dUI-button-group ${className}`}>
			{children}
		</div>
	);
};

export const SegmentButton = ({
	options = [],
	value,
	onChange
}: {
	options?: Option[];
	value?: BasicType;
	onChange?: (v?: BasicType, opt?: Option) => void;
}) => {
	const [checkedValue, setState] = useState(value);
	useEffect(() => {
		if (value !== checkedValue) setState(value);
	}, [value]);
	return (
		<Group className="segment">
			{options.map((item) => (
				<Button
					type="segment"
					className={checkedValue === item.value ? 'active' : ''}
					onClick={() =>
						onChange ? onChange(checkedValue, item) : setState(item.value)
					}
				>
					{item.label}
				</Button>
			))}
		</Group>
	);
};

Button.Group = Group;

export default Button;
