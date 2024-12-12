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
import ArrowRight from '@docucraft/icons/svg/ArrowRightFill';
import ArrowDown from '@docucraft/icons/svg/ArrowDropDownFill';
import { HeadingView } from '.';
import Popover from '@mui/material/Popover';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { OrderType, OutlineTree } from '../outline';
import { useNodeView } from '../../utils/view';
import Tools from '../toolBar/Tools';
import Toast from '../Toast';
import { NormalTooltip } from '../../kits';
import { classnames } from '../../utils';
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

const SymbolControlBtn = ({
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

function BasicPopover({
	children,
	outlineTree
}: {
	children: VNode | VNode[];
	outlineTree: OutlineTree;
}) {
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

	const handleClick = (event: Event) => {
		setAnchorEl(event.currentTarget as HTMLButtonElement);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);
	const id = open ? 'simple-popover' : undefined;
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
				<SymbolControlBtn
					close={handleClose}
					onChange={(val) => outlineTree.setOrderType(val)}
				/>
			</Popover>
		</>
	);
}

export default ({ view, level, fold, hidden, id }: Props) => {
	const outlineTree = view.outlineTree;
	const { $dom, $contentDOM } = useNodeView(view);
	const Tag = `h${level}`;

	return (
		<Tools
			toolsAfter={
				<>
					<NormalTooltip disableInteractive title="点击复制标题">
						<span
							style={{ fontSize: 16, padding: '4px', opacity: 0.8 }}
							className="iconButton"
							onClick={() => {
								navigator.clipboard
									.writeText(view.node.textContent)
									.then(() => Toast.success('已复制'));
							}}
						>
							{`h${level}`}
						</span>
					</NormalTooltip>
					<NormalTooltip disableInteractive title={fold ? '展开' : '折叠'}>
						<span
							className="iconButton"
							style={{ marginRight: 4 }}
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
						>
							{fold ? <ArrowRight /> : <ArrowDown />}
						</span>
					</NormalTooltip>
				</>
			}
		>
			<Tag
				ref={$dom}
				id={id}
				className={classnames('heading relative', {
					hidden,
					empty: !view.node.textContent
				})}
				data-placeholder={`标题${level}`}
			>
				<div className="heading-tools tools" contentEditable="false"></div>
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
				<div ref={$contentDOM} className="heading-content" />
			</Tag>
		</Tools>
	);
};
