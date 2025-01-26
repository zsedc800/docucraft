import InputBase from '@mui/material/InputBase';
import Box from '@mui/material/Box';
import SvgSearch from '@docucraft/icons/svg/Search';
import SvgClose from '@docucraft/icons/svg/Close';
import { ReactNode, HTMLAttributes, useState } from '@docucraft/srender';

type Merge<T, U> = Omit<T, keyof U> & U;

type Props = Merge<
	HTMLAttributes<HTMLDivElement>,
	{
		placeholder?: string;
		children?: ReactNode;
		onChange?: (q: string) => void;
		onSearch?: () => void;
		clearable?: boolean;
	}
>;

export default function SearchBox({
	placeholder = '搜索',
	children,
	onChange,
	onSearch,
	clearable = true,
	...attrs
}: Props) {
	const [searchVal, setVal] = useState('');
	return (
		<div {...attrs}>
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
						flexShrink: 0
					},
					'& .icon-search': {
						marginRight: 1
					},
					'& .search-input': {
						flexGrow: 1
					},
					'& .icon-close': {
						cursor: 'pointer'
					}
				})}
			>
				<SvgSearch onClick={onSearch} className="icon icon-search" />
				<InputBase
					className="search-input"
					onKeyUp={(e) => {
						if (e.key === 'Enter') onSearch && onSearch();
					}}
					onChange={(e) => {
						setVal(e.target.value);
						onChange && onChange(e.target.value);
					}}
					placeholder={placeholder}
					inputProps={{ 'aria-label': placeholder }}
					value={searchVal}
				/>
				{searchVal && clearable && (
					<SvgClose
						className="icon icon-close"
						onClick={() => {
							setVal('');
							onChange && onChange('');
						}}
					/>
				)}
			</Box>

			{children}
		</div>
	);
}
