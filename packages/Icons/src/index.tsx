// import { MaterialIcon } from './iconName';
import { IconNames, iconNameMap } from './iconConf';
import { IconType, getIconType } from './vars';
import { HTMLAttributes, forwardRef } from 'react';
import { classnames } from './utils';
export interface Props extends HTMLAttributes<HTMLElement> {
	name: IconNames;
}
export type IconName = IconNames;
export { iconNameMap } from './iconConf';

export default forwardRef<HTMLElement, Props>(
	({ name, className, color, style, children, ...attrs }, ref) => {
		// type = type || getIconType();
		// const [isFontLoaded, setState] = useState(false);
		// useEffect(() => {
		// 	document.fonts.ready.then(() => setState(true));
		// }, []);
		return (
			<i
				ref={ref}
				className={classnames(className, 'dUI-icons')}
				style={{
					...style,
					color
				}}
				{...attrs}
				dangerouslySetInnerHTML={
					children
						? void 0
						: {
								__html: `&#${iconNameMap[name]};`
							}
				}
			>
				{children}
			</i>
		);
	}
);
