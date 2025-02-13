import { IconName } from '@docucraft/icons';
import { BasicType, ElementProps, Option } from '../interfaces';
import { MouseEvent } from 'react';
import './style';
interface Props extends ElementProps {
    disabled?: boolean;
    text?: string;
    type?: 'elevated' | 'filled' | 'filled-tonal' | 'outlined' | 'text' | 'segment' | 'fab' | 'extended-fab';
    icon?: IconName;
    onClick?: (e: MouseEvent) => void;
}
declare const Button: {
    ({ text, children, type, icon, style, className, disabled, onClick }: Props): import("react/jsx-runtime").JSX.Element;
    Group: ({ children, style, className }: ElementProps) => import("react/jsx-runtime").JSX.Element;
};
export declare const Group: ({ children, style, className }: ElementProps) => import("react/jsx-runtime").JSX.Element;
export declare const SegmentButton: ({ options, value, onChange }: {
    options?: Option[];
    value?: BasicType;
    onChange?: (v?: BasicType, opt?: Option) => void;
}) => import("react/jsx-runtime").JSX.Element;
export default Button;
