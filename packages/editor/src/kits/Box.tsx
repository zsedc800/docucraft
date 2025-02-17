import { ElementType, forwardRef } from '@docucraft/srender';
import { BaseProps } from '../interface';
export default forwardRef<HTMLElement, BaseProps<{ component?: ElementType }>>(
	({ component = 'div', ...props }, ref) => {
		const Tag = component;
		return <Tag ref={ref} {...props} />;
	}
);
