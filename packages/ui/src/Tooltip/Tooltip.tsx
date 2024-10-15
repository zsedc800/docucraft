import { FC, useEffect } from 'react';
import { Tooltip } from './tooltip';
import { Base, generateTrigger } from '../Trigger';

interface Props extends Base {
	trigger?: 'click' | 'hover';
}

const Trigger = generateTrigger();

const TooltipComponent: FC<Props> & { tooltip: Tooltip } = ({
	children,
	content,
	open,
	onOpenChange
}) => {
	useEffect(() => {}, []);
	return (
		<Trigger open={open} onOpenChange={onOpenChange} content={content}>
			{children}
		</Trigger>
	);
};
if (typeof window !== 'undefined') TooltipComponent.tooltip = new Tooltip();

export default TooltipComponent;
