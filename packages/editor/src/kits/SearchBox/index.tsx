import InputBase from '@mui/material/InputBase';
import Box from '@mui/material/Box';
import SvgSearch from '@docucraft/icons/svg/Search';
import { ReactNode } from '@docucraft/srender';
export default function SearchBox({
	placeholder = '搜索Unsplash图片',
	children,
	onChange,
	onSearch
}: {
	placeholder?: string;
	children?: ReactNode;
	onChange?: (q: string) => void;
	onSearch?: () => void;
}) {
	return (
		<div>
			<Box
				sx={(t) => ({
					display: 'flex',
					alignItems: 'center',
					borderRadius: t.shape.borderRadius,
					backgroundColor: 'grey.100',
					padding: '4px 8px',
					'& .icon': {
						fontSize: '20px',
						color: 'text.secondary',
						marginRight: 1
					}
				})}
			>
				<SvgSearch onClick={onSearch} className="icon" />
				<InputBase
					onKeyUp={(e) => {
						if (e.key === 'Enter') onSearch && onSearch();
					}}
					onChange={(e) => onChange && onChange(e.target.value)}
					placeholder={placeholder}
					inputProps={{ 'aria-label': placeholder }}
				/>
			</Box>

			{children}
		</div>
	);
}
