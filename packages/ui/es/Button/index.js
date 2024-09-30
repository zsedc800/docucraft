import Icon from '@docucraft/icons';
import { useEffect, useState } from 'react';
import './style';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const Button = ({
  text,
  children,
  type,
  icon,
  style,
  className,
  disabled,
  onClick
}) => {
  return /*#__PURE__*/_jsxs("button", {
    onClick: e => {
      !disabled && onClick && onClick(e);
    },
    style: style,
    className: `dUI-button${type ? ' dUI-button--' + type : ''}${className ? ' ' + className : ''}${disabled ? ' disabled' : ''}`,
    children: [icon ? /*#__PURE__*/_jsx(Icon, {
      name: icon
    }) : null, /*#__PURE__*/_jsx("span", {
      className: "dUI-button__label",
      children: text || children
    })]
  });
};
export const Group = ({
  children,
  style,
  className
}) => {
  return /*#__PURE__*/_jsx("div", {
    style: style,
    className: `dUI-button-group ${className}`,
    children: children
  });
};
export const SegmentButton = ({
  options = [],
  value,
  onChange
}) => {
  const [checkedValue, setState] = useState(value);
  useEffect(() => {
    if (value !== checkedValue) setState(value);
  }, [value]);
  return /*#__PURE__*/_jsx(Group, {
    className: "segment",
    children: options.map(item => /*#__PURE__*/_jsx(Button, {
      type: "segment",
      className: checkedValue === item.value ? 'active' : '',
      onClick: () => onChange ? onChange(checkedValue, item) : setState(item.value),
      children: item.label
    }))
  });
};
Button.Group = Group;
export default Button;
//# sourceMappingURL=index.js.map