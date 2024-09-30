import { getIconType } from './vars';
export const SVGIcon = () => null;
export default ({ name, type, onClick, className, style = {} }) => {
    type = type || getIconType();
    return (<i onClick={onClick} className={`dUI-icons${type === 'filled' ? '' : '-' + type}${className ? ' ' + className : ''}`}>
			{name}
		</i>);
};
