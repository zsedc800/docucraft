import { getIconType } from './vars';
export const SVGIcon = () => null;
export default ({ name, type }) => {
    type = type || getIconType();
    return (<i className={`dUI-icons${type === 'filled' ? '' : '-' + type}`}>{name}</i>);
};
