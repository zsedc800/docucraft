import { MaterialIcon } from 'material-icons';
import { IconType, getIconType } from './vars';
import type { CSSProperties } from 'react';
export interface Props {
	name: MaterialIcon;
	className?: string;
	style?: CSSProperties;
	type?: IconType;
	onClick?: (e: any) => void;
}
export type IconName = MaterialIcon;
export const SVGIcon = () => null;

export default ({ name, type, onClick, className, style = {} }: Props) => {
	type = type || getIconType();
	return (
		<i
			style={style}
			onClick={onClick}
			className={`dUI-icons${type === 'filled' ? '' : '-' + type}${className ? ' ' + className : ''}`}
		>
			{name}
		</i>
	);
};
