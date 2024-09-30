import { MaterialIcon } from 'material-icons';
import type { CSSProperties } from 'react';
export type IconType = 'filled' | 'outlined' | 'round' | 'sharp' | 'two-tone';
export declare const setCurrentIconType: (type: IconType) => IconType;
export declare const getIconType: () => IconType;
export interface Props {
    name: MaterialIcon;
    className?: string;
    style?: CSSProperties;
    type?: IconType;
    onClick?: (e: any) => void;
}
export type IconName = MaterialIcon;
export declare const SVGIcon: () => any;
declare const _default: ({ name, type, onClick, className, style }: Props) => import("react").JSX.Element;
export default _default;
