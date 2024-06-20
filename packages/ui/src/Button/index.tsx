import Icon, { IconName } from '@docucraft/icons';
import './style';
import { CSSProperties, ReactNode } from 'react';
interface Props {
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
	children?: ReactNode;
	icon?: IconName;
	style?: CSSProperties;
	className?: string;
}
// console.log(Icon);

export default ({
	text,
	children,
	type,
	icon = 'home',
	style,
	className
}: Props) => {
	return (
		<button
			style={style}
			className={`dUI-button${type ? ' dUI-button--' + type : ''}${className ? ' ' + className : ''}`}
		>
			{icon ? <Icon name={icon} /> : null}
			<span className="dUI-button__label">{text || children}</span>
		</button>
	);
};
