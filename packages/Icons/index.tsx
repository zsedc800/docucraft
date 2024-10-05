import { MaterialIcon } from './iconName';
import { IconType, getIconType } from './vars';
import { useEffect, useState, type CSSProperties } from 'react';
export * from './svg';
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
	const [isFontLoaded, setState] = useState(false);
	useEffect(() => {
		document.fonts.ready.then(() => setState(true));
	}, []);
	return (
		<i
			style={style}
			onClick={onClick}
			className={`dUI-icons${type === 'filled' ? '' : '-' + type}${className ? ' ' + className : ''}`}
		>
			{isFontLoaded ? name : ''}
		</i>
	);
};
