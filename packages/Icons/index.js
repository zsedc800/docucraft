import { jsx as _jsx } from "react/jsx-runtime";
import { getIconType } from './vars';
export const SVGIcon = () => null;
export default ({ name, type, onClick, className, style = {} }) => {
    type = type || getIconType();
    return (_jsx("i", { style: style, onClick: onClick, className: `dUI-icons${type === 'filled' ? '' : '-' + type}${className ? ' ' + className : ''}`, children: name }));
};
