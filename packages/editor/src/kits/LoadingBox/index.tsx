import { CSSProperties, ReactNode, forwardRef } from '@docucraft/srender';
import CircularProgress from '@mui/material/CircularProgress';
import { classnames } from '../../utils';

export default forwardRef<
	HTMLDivElement,
	{
		children: ReactNode;
		loading: boolean;
		className?: string;
		style?: CSSProperties;
	}
>(({ children, loading, className, style }, ref) => {
	return (
		<div
			ref={ref}
			style={style}
			className={classnames('loading-box relative', className, { loading })}
		>
			{children}
			{loading && (
				<div className="loading-bar">
					<CircularProgress />
				</div>
			)}
		</div>
	);
});
