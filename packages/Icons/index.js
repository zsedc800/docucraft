import { jsx as _jsx } from "react/jsx-runtime";
import { getIconType } from './vars';
import { forwardRef, useEffect, useState } from 'react';
export const SVGIcon = () => null;
export default forwardRef(({ name, type, onClick, className, style = {} }, ref) => {
    type = type || getIconType();
    const [isFontLoaded, setState] = useState(false);
    useEffect(() => {
        document.fonts.ready.then(() => setState(true));
    }, []);
    return (_jsx("i", { ref: ref, style: style, onClick: onClick, className: `dUI-icons${type === 'filled' ? '' : '-' + type}${className ? ' ' + className : ''}`, children: isFontLoaded ? name : '' }));
});
