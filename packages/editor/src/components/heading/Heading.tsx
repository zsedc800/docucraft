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
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { HeadingView } from './view';
import { OutlineTree } from '../outline';
import { BaseNodeViewProps, useNodeView } from '../../utils/view';
import Tools from '../toolBar/Tools';
import Toast from '../Toast';
import { NormalTooltip } from '../../kits';
import { classnames } from '../../utils';
import { SymbolControlBtn } from './SymbolCtrl';
import { ToggleButton } from '../../kits/ToggleButton';
import { IconPicker, PickerValue } from '../../kits/Picker';
import { ImageUploader } from '../../kits/Uploader';
import { Helmet } from '../../kits/helmet';
import { ColorPalette } from '../../kits/Button/OPMenus';
import { Overrides } from '../../interface';
import './style.scss';

export type Level = 1 | 2 | 3 | 4 | 5 | 6;
export interface Props {
	view: HeadingView;
	nodeView: HeadingView;
	level: Level;
	fold: boolean;
	hidden: boolean;
	blockId: string;
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
								nodeView.setNodeAttribute(
									'banner',
									image.urls?.raw || image.src
								);
								close();
							}}
						/>
					)}
				>
					修改封面
				</ToggleButton>
				<ToggleButton onClick={() => nodeView.setNodeAttribute('banner', '')}>
					<Icon name="delete" />
				</ToggleButton>
			</div>
		</div>
	);
}

export default ({
	nodeView: view,
	level,
	fold,
	hidden,
	blockId: id,
	icon,
	banner,
	selected,
	color,
	bgColor
}: Overrides<BaseNodeViewProps, Props>) => {
	const outlineTree = view.outlineTree;
	const { $dom, $contentDOM } = useNodeView(view);
	const Tag = `h${level}`;
	const hasTools = view.depth === 0 && level > 1;

	const container = (
		<div
			style={{ color, backgroundColor: bgColor }}
			className={classnames('heading-container', { selected })}
		>
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

			<Typography
				variant={`h${level}`}
				ref={$contentDOM}
				data-placeholder={level === 1 ? '未命名标题' : `标题${level}`}
				className={classnames('heading-content relative', {
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
			className={classnames('heading relative', `h${level}`, {
				hidden
			})}
		>
			{level === 1 ? (
				<>
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
										onChange={(image, extra) => {
											view.setNodeAttribute(
												'banner',
												image.urls?.raw || image.src
											);
											close();
										}}
									/>
								)}
							>
								<Icon name="image" /> 添加封面
							</ToggleButton>
						)}
						{!icon && (
							<IconPicker
								onChange={(ico) => view.setNodeAttribute('icon', ico)}
							>
								<Icon name="mood" /> 添加图标
							</IconPicker>
						)}
					</div>
				</>
			) : null}
			{hasTools ? (
				<Tools
					placement="left"
					toolsAfter={toolsAfter}
					extraMenu={ColorPalette}
				>
					{container}
				</Tools>
			) : (
				<>
					{container}
					<Helmet>
						<title>{view.node.textContent || '未命名标题'}</title>
					</Helmet>
				</>
			)}
			{typeof window !== 'undefined' &&
				banner &&
				createPortal(
					<Banner src={banner} nodeView={view} />,
					view.view.domBefore
				)}
		</div>
	);
	return body;
};
