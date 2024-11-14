import { MaterialIcon } from './iconName';
import { IconType, getIconType } from './vars';
import {
	Ref,
	forwardRef,
	useEffect,
	useState,
	type CSSProperties
} from 'react';
export interface Props {
	name: MaterialIcon;
	className?: string;
	style?: CSSProperties;
	type?: IconType;
	onClick?: (e: any) => void;
}
export type IconName = MaterialIcon;
export const SVGIcon = () => null;

export default forwardRef(
	(
		{ name, type, onClick, className, style = {} }: Props,
		ref: Ref<HTMLElement>
	) => {
		type = type || getIconType();
		const [isFontLoaded, setState] = useState(false);
		useEffect(() => {
			document.fonts.ready.then(() => setState(true));
		}, []);
		return (
			<i
				ref={ref}
				style={style}
				onClick={onClick}
				className={`dUI-icons${type === 'filled' ? '' : '-' + type}${className ? ' ' + className : ''}`}
			>
				{isFontLoaded ? name : ''}
			</i>
		);
	}
);
