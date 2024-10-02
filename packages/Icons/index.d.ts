import { MaterialIcon } from 'material-icons';
import { IconType } from './vars';
import { type CSSProperties } from 'react';
export * from './svg';
export interface Props {
    name: MaterialIcon;
    className?: string;
    style?: CSSProperties;
    type?: IconType;
    onClick?: (e: any) => void;
}
export type IconName = MaterialIcon;
export declare const SVGIcon: () => null;
declare const _default: ({ name, type, onClick, className, style }: Props) => import("react/jsx-runtime").JSX.Element;
export default _default;
