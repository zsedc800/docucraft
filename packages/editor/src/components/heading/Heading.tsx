import {
	Children,
	ComponentChildren,
	FC,
	VNode,
	cloneElement,
	useEffect,
	useLayoutEffect,
	useRef,
	useState
} from '@docucraft/srender';
import Icon from '@docucraft/icons';
import '@docucraft/icons/styles';
import { HeadingView } from '.';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import SvgHourglassEmpty from '@docucraft/icons/svg/HourglassEmpty';
import { OrderType, OutlineTree } from '../outline';
export type Level = 1 | 2 | 3 | 4 | 5 | 6;
export interface Props {
	view: HeadingView;
	level: Level;
	fold: boolean;
	hidden: boolean;
	id: string;
}

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

const SymbolControlBtn: FC<{
	close?: () => void;
	onChange?: (val: OrderType) => void;
}> = ({ close, onChange }) => {
	const [value, setValue] = useState<OrderType>(0);
	const handleChange = (e: any, val: OrderType) => {
		setValue(val);
		if (close) close();
		if (onChange) onChange(val);
	};
	return (
		<ToggleButtonGroup exclusive value={value} onChange={handleChange}>
			{/* @ts-ignore */}
			<ToggleButton value={1}>
				{/* @ts-ignore */}
				<OrderTypeItem data={['1.', '1.1.', '1.1.1.']} />
			</ToggleButton>
			{
				(
					<ToggleButton value={2}>
						{/* @ts-ignore */}
						<OrderTypeItem data={['一、', '(一)', '1.']} />
					</ToggleButton>
				) as any
			}
			{/* @ts-ignore */}
			<ToggleButton value={3}>
				{/* @ts-ignore */}
				<OrderTypeItem data={['1.', 'a.', 'i.']} />
			</ToggleButton>
		</ToggleButtonGroup>
	);
};

function BasicPopover({
	children,
	outlineTree
}: {
	children: VNode | VNode[];
	outlineTree: OutlineTree;
}) {
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

	const handleClick = (event: Event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);
	const id = open ? 'simple-popover' : undefined;
	const ref = useRef<HTMLButtonElement>();
	const child = Children.only(children);
	useEffect(() => {}, []);
	return (
		<>
			{cloneElement(child, {
				...child.props,
				onClick: (e: Event) => {
					child.props.onClick?.(e);
					handleClick(e);
				}
			})}
			<Popover
				id={id}
				open={open}
				anchorEl={anchorEl}
				onClose={handleClose}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'left'
				}}
			>
				{/* @ts-ignore */}
				<SymbolControlBtn
					close={handleClose}
					onChange={(val) => outlineTree.setOrderType(val)}
				/>
			</Popover>
		</>
	);
}

export default ({ view, level, fold, hidden, id }: Props) => {
	const $heading = useRef<HTMLElement>();
	const $content = useRef<HTMLDivElement>();
	const outlineTree = view.outlineTree;
	useLayoutEffect(() => {
		if ($heading.current) view.dom = $heading.current;
		view.contentDOM = $content.current;
	}, []);
	const Tag = `h${level}`;

	return (
		<Tag ref={$heading} id={id} className={`heading ${hidden ? 'hidden' : ''}`}>
			<div className="heading-tools" contentEditable="false">
				<Icon
					className="toggle-button"
					name={fold ? 'arrow_drop_down' : 'arrow_right'}
					onClick={() => {
						const pos = view.getPos();

						let tr = view.view.state.tr.setMeta('toggleHeading', {
							hidden: !fold,
							pos
						});

						if (typeof pos !== 'undefined')
							tr = tr.setNodeMarkup(pos, null, {
								...view.node.attrs,
								fold: !fold
							});
						view.view.dispatch(tr);
					}}
				/>
			</div>
			{outlineTree && outlineTree.orderType ? (
				<BasicPopover outlineTree={outlineTree}>
					<span
						className="list-symbol"
						data-type={outlineTree.orderType}
						data-level={outlineTree.dataLevel(view.id)}
						contentEditable="false"
					>
						{outlineTree.calculateOrderNumber(view.id)}
					</span>
				</BasicPopover>
			) : (
				<></>
			)}
			<div ref={$content} className="heading-content"></div>
		</Tag>
	);
};
