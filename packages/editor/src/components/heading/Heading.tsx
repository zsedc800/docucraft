import {
	Children,
	VNode,
	cloneElement,
	createPortal,
	useEffect,
	useState
} from '@docucraft/srender';
import ArrowRight from '@docucraft/icons/svg/ArrowRightFill';
import ArrowDown from '@docucraft/icons/svg/ArrowDropDownFill';
import Icon from '@docucraft/icons';
import { HeadingView } from '.';
import Popover from '@mui/material/Popover';
import { OutlineTree } from '../outline';
import { useNodeView } from '../../utils/view';
import Tools from '../toolBar/Tools';
import Toast from '../Toast';
import { NormalTooltip } from '../../kits';
import { classnames } from '../../utils';
import { SymbolControlBtn } from './SymbolCtrl';
import { ToggleButton } from '../../kits/ToggleButton';
import { IconPicker, PickerValue } from '../../kits/Picker';
import { ImageUploader } from '../../kits/Uploader';
export type Level = 1 | 2 | 3 | 4 | 5 | 6;
export interface Props {
	view: HeadingView;
	level: Level;
	fold: boolean;
	hidden: boolean;
	id: string;
	banner: string;
	icon: PickerValue;
}

interface BannerProps {
	src?: string;
	nodeView: HeadingView;
}

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

function Banner({ src, nodeView }: BannerProps) {
	return (
		<div className="banner relative" style={{ backgroundImage: `url(${src})` }}>
			<div className="banner-settings">
				<ToggleButton
					IconComponent={() => null}
					className="mr-2"
					subPanel={({ close }) => (
						<ImageUploader
							onChange={(image) => {
								nodeView.setNodeAttribute('banner', image.src);
								close();
							}}
						/>
					)}
				>
					<Icon name="image" /> 修改封面
				</ToggleButton>
				<ToggleButton onClick={() => nodeView.setNodeAttribute('banner', '')}>
					<Icon name="delete" />
				</ToggleButton>
			</div>
		</div>
	);
}

export default ({ view, level, fold, hidden, id, icon, banner }: Props) => {
	const outlineTree = view.outlineTree;
	const { $dom, $contentDOM } = useNodeView(view);
	const Tag = `h${level}`;
	const isToplevel = view.depth === 0 || level === 1;

	const container = (
		<div className="heading-container">
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

			<Tag
				ref={$contentDOM}
				data-placeholder={`标题${level}`}
				className={classnames('heading-content', {
					empty: !view.node.textContent
				})}
			/>
		</div>
	);

	const toolsAfter = (
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
	);
	const body = (
		<div
			ref={$dom}
			id={id}
			className={classnames('heading relative', {
				hidden
			})}
		>
			<div className="heading-icon" contentEditable={false}>
				{icon && (
					<IconPicker
						className="heading-icon-picker"
						onChange={(i) => view.setNodeAttribute('icon', i)}
					>
						{icon.type === 'emoji' ? (
							icon.value
						) : (
							<Icon name={icon.value as any} color={icon.color} />
						)}
					</IconPicker>
				)}
			</div>
			<div className="heading-tools" contentEditable={false}>
				{!banner && (
					<ToggleButton
						IconComponent={() => null}
						className="mr-1"
						subPanel={({ close }) => (
							<ImageUploader
								onChange={(image) => {
									view.setNodeAttribute('banner', image.src);
									close();
								}}
							/>
						)}
					>
						<Icon name="image" /> 添加封面
					</ToggleButton>
				)}
				{!icon && (
					<IconPicker onChange={(ico) => view.setNodeAttribute('icon', ico)}>
						<Icon name="mood" /> 添加图标
					</IconPicker>
				)}
			</div>
			{isToplevel ? (
				<Tools placement="left" visible toolsAfter={toolsAfter}>
					{container}
				</Tools>
			) : (
				container
			)}
			{typeof window !== 'undefined' &&
				banner &&
				createPortal(
					<Banner src={banner} nodeView={view} />,
					view.view.dom.parentNode.previousSibling as HTMLElement
				)}
		</div>
	);
	return body;
};
