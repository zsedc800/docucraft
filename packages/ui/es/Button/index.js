import { jsxs, jsx } from 'react/jsx-runtime';
import Icon from '@docucraft/icons';
import { useState, useEffect } from 'react';
import '@docucraft/icons/styles';
import '../styles/themes/green.css';
import '../styles/global.css';
import './style/style.css';

const Button = ({ text, children, type, icon, style, className, disabled, onClick }) => {
    return (jsxs("button", { onClick: (e) => {
            !disabled && onClick && onClick(e);
        }, style: style, className: `dUI-button${type ? ' dUI-button--' + type : ''}${className ? ' ' + className : ''}${disabled ? ' disabled' : ''}`, children: [icon ? jsx(Icon, { name: icon }) : null, jsx("span", { className: "dUI-button__label", children: text || children })] }));
};
const Group = ({ children, style, className }) => {
    return (jsx("div", { style: style, className: `dUI-button-group ${className}`, children: children }));
};
const SegmentButton = ({ options = [], value, onChange }) => {
    const [checkedValue, setState] = useState(value);
    useEffect(() => {
        if (value !== checkedValue)
            setState(value);
    }, [value]);
    return (jsx(Group, { className: "segment", children: options.map((item) => (jsx(Button, { type: "segment", className: checkedValue === item.value ? 'active' : '', onClick: () => onChange ? onChange(checkedValue, item) : setState(item.value), children: item.label }))) }));
};
Button.Group = Group;

export { Group, SegmentButton, Button as default };
