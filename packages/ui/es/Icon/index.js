import { jsx as _jsx } from "react/jsx-runtime";
let iconType = 'filled';
export const setCurrentIconType = type => iconType = type;
export const getIconType = () => iconType;
export const SVGIcon = () => null;
export default (({
  name,
  type,
  onClick,
  className,
  style = {}
}) => {
  type = type || getIconType();
  return /*#__PURE__*/_jsx("i", {
    style: style,
    onClick: onClick,
    className: `dUI-icons${type === 'filled' ? '' : '-' + type}${className ? ' ' + className : ''}`,
    children: name
  });
});
//# sourceMappingURL=index.js.map