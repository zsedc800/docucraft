import { jsx as _jsx } from "react/jsx-runtime";
// import { MaterialIcon } from './iconName';
import { iconNameMap } from './iconConf';
import { forwardRef } from 'react';
import { classnames } from './utils';
export * from './svg';
export default forwardRef(({ name, className, ...attrs }, ref) => {
    // type = type || getIconType();
    // const [isFontLoaded, setState] = useState(false);
    // useEffect(() => {
    // 	document.fonts.ready.then(() => setState(true));
    // }, []);
    return (_jsx("i", { ref: ref, className: classnames(className, 'dUI-icons'), ...attrs, dangerouslySetInnerHTML: {
            __html: `&#${iconNameMap[name]};`
        } }));
});
