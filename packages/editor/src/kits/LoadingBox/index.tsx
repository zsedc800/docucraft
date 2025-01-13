import { CSSProperties, ReactNode } from '@docucraft/srender';
import CircularProgress from '@mui/material/CircularProgress';
import { classnames } from '../../utils';

export default ({
	children,
	loading,
	className,
	style
}: {
	children: ReactNode;
	loading: boolean;
	className?: string;
	style?: CSSProperties;
}) => {
	return (
		<div
			style={style}
			className={classnames('loading-box relative', className, { loading })}
		>
			{children}
			{loading && (
				<div
					style={{
						position: 'fixed',
						left: '50%',
						top: '50%',
						transform: `translate(-50%, -50%)`
					}}
				>
					<CircularProgress />
				</div>
			)}
		</div>
	);
};
