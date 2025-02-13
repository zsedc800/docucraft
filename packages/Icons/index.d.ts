import { IconNames } from './iconConf';
import { HTMLAttributes } from 'react';
export interface Props extends HTMLAttributes<HTMLElement> {
    name: IconNames;
}
export type IconName = IconNames;
export { iconNameMap } from './iconConf';
declare const _default: import("react").ForwardRefExoticComponent<Props & import("react").RefAttributes<HTMLElement>>;
export default _default;
