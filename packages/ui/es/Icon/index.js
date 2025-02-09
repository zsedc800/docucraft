import { jsx } from 'react/jsx-runtime';

let iconType = 'filled';
const setCurrentIconType = (type) => (iconType = type);
const getIconType = () => iconType;
var index = ({ name, type, onClick, className, style = {} }) => {
    type = type || getIconType();
    return (jsx("i", { style: style, onClick: onClick, className: `dUI-icons${type === 'filled' ? '' : '-' + type}${className ? ' ' + className : ''}`, children: name }));
};

export { index as default, getIconType, setCurrentIconType };
