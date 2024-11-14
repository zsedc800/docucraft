import { MaterialIcon } from './iconName';
import { IconType } from './vars';
import { type CSSProperties } from 'react';
export interface Props {
    name: MaterialIcon;
    className?: string;
    style?: CSSProperties;
    type?: IconType;
    onClick?: (e: any) => void;
}
export type IconName = MaterialIcon;
export declare const SVGIcon: () => null;
declare const _default: import("react").ForwardRefExoticComponent<Props & import("react").RefAttributes<HTMLElement>>;
export default _default;
