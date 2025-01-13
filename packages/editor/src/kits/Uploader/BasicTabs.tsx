import {
	useState,
	ReactNode,
	Children,
	CSSProperties
} from '@docucraft/srender';
import { TabPanelProps } from '@mui/lab/TabPanel';
import Box from '@mui/material/Box';
import Tab, { TabProps } from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { SyntheticEvent } from 'react';
import { classnames } from '../../utils';

export function TabChild({
	children
}: Omit<TabProps, 'children'> &
	Omit<TabPanelProps, 'children'> & { children?: ReactNode }) {
	return children;
}

interface Props {
	children: ReactNode;
	defaultValue?: any;
	style?: CSSProperties;
	className?: string;
	dense?: boolean;
	align?: 'left' | 'center' | 'right';
	slotProps?: { tabs: TabProps };
}

function a11yProps(index: number) {
	return {
		id: `simple-tab-${index}`,
		'aria-controls': `simple-tabpanel-${index}`
	};
}

export default ({
	children,
	defaultValue,
	style,
	className,
	dense,
	align,
	slotProps
}: Props) => {
	const [value, setValue] = useState<any>(defaultValue);
	const handleChange = (event: SyntheticEvent, newValue: any) => {
		setValue(newValue);
	};
	const denseProps = dense ? { minWidth: '0', minHeight: '0' } : {};
	return (
		<Box className={classnames(className)} style={style}>
			<Box>
				<Tabs
					sx={(t) => ({
						borderBottom: `1px solid ${t.palette.divider}`,
						minHeight: 0,
						'& [role=tablist]': {
							justifyContent: align
						},
						'& .MuiTab-root': {
							textTransform: 'none',
							...denseProps
						}
					})}
					value={value}
					onChange={handleChange}
					aria-label="tablist"
				>
					{Children.map(children, (child: any, index) => {
						const { children, ...props } = child.props;
						return <Tab {...{ ...props, ...a11yProps(index) }} />;
					})}
				</Tabs>
			</Box>
			<Box sx={{ padding: 1 }}>
				{Children.map(children, (child: any, index) => {
					const { children, ...props } = child.props || {};
					return <div {...props}>{props.value === value && children}</div>;
				})}
			</Box>
		</Box>
	);
};
