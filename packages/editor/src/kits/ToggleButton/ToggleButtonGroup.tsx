import { ReactNode } from 'react';
import { classnames } from '../../utils';
import {
	CSSProperties,
	Children,
	cloneElement,
	useState
} from '@docucraft/srender';

interface Props {
	children: ReactNode;
	className?: string;
	onChange?: (e: any) => void;
	style?: CSSProperties;
	value?: any;
}
export default ({ children, className, onChange, style, value }: Props) => {
	// const [value, setValue] = useState<any>(null);

	return (
		<div style={style} className={classnames('toggle-button-group', className)}>
			{
				Children.map(children, (child: any) => {
					const val = child.props.value;
					const onClick = (e: any) => {
						if (typeof child.props.onClick === 'function') {
							child.props.onClick(e);
						}
						// setValue(val);
						if (typeof onChange === 'function') onChange(val);
					};
					return cloneElement(child as any, {
						...child.props,
						onClick,
						actived: val === value
					});
				}) as any
			}
		</div>
	);
};
