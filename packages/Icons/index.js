import { jsx as _jsx } from "react/jsx-runtime";
import { getIconType } from './vars';
import { useEffect, useState } from 'react';
export * from './svg';
export const SVGIcon = () => null;
export default ({ name, type, onClick, className, style = {} }) => {
    type = type || getIconType();
    const [isFontLoaded, setState] = useState(false);
    useEffect(() => {
        document.fonts.ready.then(() => setState(true));
    }, []);
    return (_jsx("i", { style: style, onClick: onClick, className: `dUI-icons${type === 'filled' ? '' : '-' + type}${className ? ' ' + className : ''}`, children: isFontLoaded ? name : '' }));
};
