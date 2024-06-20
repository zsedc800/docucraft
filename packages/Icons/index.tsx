import { MaterialIcon } from 'material-icons';
import { IconType, getIconType } from './vars';
// import Srender from '@docucraft/srender';
export interface Props {
	name: MaterialIcon;
	type?: IconType;
}
export type IconName = MaterialIcon;
export const SVGIcon = () => null;

export default ({ name, type }: Props) => {
	type = type || getIconType();
	return (
		<i className={`dUI-icons${type === 'filled' ? '' : '-' + type}`}>{name}</i>
	);
};
