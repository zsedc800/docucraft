import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import { OrderType } from '../outline';
import { useState } from '@docucraft/srender';

const OrderTypeItem = ({ data = [] }: { data: string[] }) => {
	const [l1, l2, l3] = data;
	return (
		<ul className="order-type-item">
			<li>
				<span className="order-symbol">{l1}</span>{' '}
				<div style={{ height: '9px' }} className="shape"></div>
			</li>
			<li>
				<div className="shape"></div>
			</li>
			<li>
				<div className="shape"></div>
			</li>
			<li>
				<span className="order-symbol">{l2}</span>
				<div style={{ height: '7px' }} className="shape"></div>
			</li>
			<li>
				<div className="shape"></div>
			</li>
			<li>
				<span className="order-symbol">{l3}</span>
				<div style={{ height: '5px' }} className="shape"></div>
			</li>
		</ul>
	);
};

export const SymbolControlBtn = ({
	close,
	onChange
}: {
	close?: () => void;
	onChange?: (val: OrderType) => void;
}) => {
	const [value, setValue] = useState<OrderType>(0);
	const handleChange = (e: any, val: OrderType) => {
		setValue(val);
		if (close) close();
		if (onChange) onChange(val);
	};
	return (
		<ToggleButtonGroup exclusive value={value} onChange={handleChange}>
			<ToggleButton value={1}>
				<OrderTypeItem data={['1.', '1.1.', '1.1.1.']} />
			</ToggleButton>

			<ToggleButton value={2}>
				<OrderTypeItem data={['一、', '(一)', '1.']} />
			</ToggleButton>

			<ToggleButton value={3}>
				<OrderTypeItem data={['1.', 'a.', 'i.']} />
			</ToggleButton>
		</ToggleButtonGroup>
	);
};
