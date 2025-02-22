import { jsx as _jsx } from 'react/jsx-runtime';
// import { MaterialIcon } from './iconName';
import { iconNameMap } from './iconConf';
import { forwardRef } from 'react';
import { classnames } from './utils';
export { iconNameMap } from './iconConf';
export default forwardRef(
	({ name, className, children, color, style, ...attrs }, ref) => {
		// type = type || getIconType();
		// const [isFontLoaded, setState] = useState(false);
		// useEffect(() => {
		// 	document.fonts.ready.then(() => setState(true));
		// }, []);
		return _jsx('i', {
			ref: ref,
			className: classnames(className, 'dUI-icons'),
			style: { ...style, color },
			...attrs,
			dangerouslySetInnerHTML: children
				? void 0
				: {
						__html: `&#${iconNameMap[name]};`
					},
			children: children
		});
	}
);
