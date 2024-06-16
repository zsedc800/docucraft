/// <reference types="react" />
import { MaterialIcon } from 'material-icons';
import { IconType } from './vars';
export interface Props {
    name: MaterialIcon;
    type?: IconType;
}
export declare const SVGIcon: () => null;
declare const _default: ({ name, type }: Props) => import("react").JSX.Element;
export default _default;
