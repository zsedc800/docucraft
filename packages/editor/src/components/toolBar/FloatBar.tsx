import { EditorView } from 'prosemirror-view';
import { basePop, usePlainPopover, usePopover } from '../popover';
import Box from '@mui/material/Box';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import FormatBold from '@docucraft/icons/svg/FormatBoldFill';
import FormatItalic from '@docucraft/icons/svg/FormatItalic';
import FormatUnderlined from '@docucraft/icons/svg/FormatUnderlined';
import Strikethrough from '@docucraft/icons/svg/StrikethroughS';
import SvgFunction from '@docucraft/icons/svg/Function';
import SvgLink from '@docucraft/icons/svg/Link';
import SvgArrowDown from '@docucraft/icons/svg/StatMinus1';
import SvgMore from '@docucraft/icons/svg/More1';
import { NormalTooltip, RichTooltip, tooltipClasses } from '../../kits';
import { CSSProperties, ReactNode } from 'react';
import { schema } from '../../model';
import { Attrs, MarkType } from 'prosemirror-model';
import Divider from '@mui/material/Divider';
import { type TooltipProps } from '@mui/material';
import ColorMark from '../../kits/ColorMark';
import { createNode, insert, transformToNode } from '../../commands';
import { selectionContainsOnlyText } from '../../utils';
import { TextSelection } from 'prosemirror-state';

function IcoButton({
	children,
	title,
	onClick,
	color = 'inherit',
	style,
	rich,
	slotProps
}: {
	children?: ReactNode;
	title?: ReactNode;
	onClick?: (e?: any) => void;
	color?: IconButtonProps['color'];
	style?: CSSProperties;
	rich?: boolean;
	slotProps?: {
		tooltip: Omit<TooltipProps, 'children'>;
		button: IconButtonProps;
	};
}) {
	const Tooltip = rich ? RichTooltip : NormalTooltip;

	return (
		<Tooltip
			title={title}
			placement="top"
			disableInteractive
			sx={{ lineHeight: 1.3 }}
			slotProps={{
				popper: {
					sx: {
						[`&.${tooltipClasses.popper}[data-popper-placement*="top"] .${tooltipClasses.tooltip}`]:
							{
								marginBottom: '8px'
							}
					}
				}
			}}
			{...slotProps?.tooltip}
		>
			<IconButton
				size="small"
				onClick={onClick}
				color={color}
				style={style}
				sx={{ borderRadius: '5px', fontSize: '18px' }}
				{...slotProps?.button}
			>
				{children}
			</IconButton>
		</Tooltip>
	);
}

const boldMark = 1;
const italicMark = 2;
const underlineMark = 4;
const strikethroughMark = 8;
const styleMark = 16;

const FloatBar = (view: EditorView) => {
	const { bold, italic, underline, linethrough, style } = schema.marks;
	const map = new Map<MarkType, number>([
		[bold, boldMark],
		[italic, italicMark],
		[underline, underlineMark],
		[linethrough, strikethroughMark],
		[style, styleMark]
	]);

	const [instance] = basePop({
		view,
		placement: 'top-start',

		render() {
			const { state } = view;
			const {
				selection: { from, to },
				doc
			} = state;

			let mark = 0;
			for (const [type, mask] of map)
				if (doc.rangeHasMark(from, to, type)) mark |= mask;
			let styleMarkNode: any = {};
			if (mark)
				doc.nodesBetween(from, to, (node, pos) => {
					if (node.isText) {
						let m = 0;
						node.marks.forEach((item) => {
							const mask = map.get(item.type);
							if (mask) {
								m |= mask;
								if (item.type === style && !styleMarkNode.attrs)
									styleMarkNode = item;
							}
						});
						mark &= ~(mark ^ m);
					}
				});
			const getMask = (mask: number) => (mark & mask ? 'primary' : void 0);
			const createAction =
				(type: MarkType, mask: number, attrs?: Attrs | null) => () => {
					const { state, dispatch } = view;
					let {
						selection: { from, to },
						tr
					} = state;
					if (getMask(mask)) tr = tr.removeMark(from, to, type);
					else tr = tr.addMark(from, to, type.create(attrs));
					dispatch(tr);
					instance.show();
				};

			const [isTextSel, linkNodes] = selectionContainsOnlyText(
				state,
				schema.nodes.link
			);
			const colorState = {
				color: styleMarkNode.attrs?.color,
				bgColor: styleMarkNode.attrs?.backgroundColor
			};

			const [colorPanel, colorPanelHolder] = usePlainPopover(
				<ColorMark
					{...colorState}
					onChange={({ color, bgColor }) => {
						const { state, dispatch } = view;
						const {
							selection: { from, to },
							tr
						} = state;
						dispatch(
							tr.addMark(
								from,
								to,
								style.create({ color, backgroundColor: bgColor })
							)
						);
						instance.show();
					}}
					onReset={() => {
						const { state, dispatch } = view;
						const {
							selection: { from, to },
							tr
						} = state;
						dispatch(tr.removeMark(from, to, style));
						instance.show();
					}}
				/>
			);
			const [{ prompt }, placeholder] = usePopover(view);

			return (
				<Box sx={{ padding: '4px', color: 'rgb(50, 48, 44)', display: 'flex' }}>
					{colorPanelHolder}
					{placeholder}
					<IcoButton style={{ padding: '0 0 0 7px' }} title="转换成">
						<span style={{ fontSize: 14 }}>文本</span>
						<SvgArrowDown style={{ fontSize: 16, opacity: 0.5 }} />
					</IcoButton>
					<IcoButton
						title={
							<>
								加粗
								<br />
								<span style={{ opacity: 0.5 }}>Ctrl+B</span>
							</>
						}
						color={getMask(boldMark)}
						onClick={createAction(bold, boldMark)}
					>
						<FormatBold />
					</IcoButton>
					<IcoButton
						color={getMask(italicMark)}
						onClick={createAction(italic, italicMark)}
						title={
							<>
								斜体
								<br />
								<span style={{ opacity: 0.5 }}>Ctrl+I</span>
							</>
						}
					>
						<FormatItalic />
					</IcoButton>
					<IcoButton
						color={getMask(underlineMark)}
						onClick={createAction(underline, underlineMark)}
						title={
							<>
								下划线
								<br />
								<span style={{ opacity: 0.5 }}>Ctrl+U</span>
							</>
						}
					>
						<FormatUnderlined />
					</IcoButton>
					<IcoButton
						color={getMask(strikethroughMark)}
						onClick={createAction(linethrough, strikethroughMark)}
						title={
							<>
								删除线
								<br />
								<span
									style={{ opacity: 0.5 }}
									dangerouslySetInnerHTML={{ __html: 'Ctrl+&#8657+X' }}
								/>
							</>
						}
					>
						<Strikethrough />
					</IcoButton>
					<IcoButton
						title={
							<>
								标记为公式
								<br />
								<span
									style={{ opacity: 0.5 }}
									dangerouslySetInnerHTML={{ __html: 'Ctrl+&#8657+E' }}
								/>
							</>
						}
					>
						<SvgFunction />
					</IcoButton>
					{isTextSel && (
						<IcoButton
							onClick={() => {
								const text = doc.textBetween(from, to);
								const [{ attrs: { href = '' } = {} } = {}] = linkNodes;
								prompt({
									title: '添加链接',
									fields: [
										{
											name: 'url',
											label: '链接地址',
											required: true,
											defaultValue: href
										},
										{ name: 'text', label: '文本', defaultValue: text }
									]
								})
									.then((res) => {
										const node = createNode(
											schema.nodes.link,
											{ href: res.url },
											schema.text(res.text)
										);
										let tr = state.tr.delete(from, to).insert(from, node);
										view.dispatch(
											tr.setSelection(
												TextSelection.create(tr.doc, from + node.nodeSize)
											)
										);
									})
									.then(() => view.focus());
							}}
							title={
								<>
									添加链接
									<br />
									<span style={{ opacity: 0.5 }}>Ctrl+K</span>
								</>
							}
						>
							<SvgLink style={{ transform: 'rotateZ(-45deg)' }} />
							<SvgArrowDown style={{ fontSize: 16, opacity: 0.5 }} />
						</IcoButton>
					)}
					<IcoButton
						onClick={colorPanel.onClick}
						style={{ padding: '0 6px 0 7px' }}
						title={
							<>
								文本颜色
								<br />
								<span
									style={{ opacity: 0.5 }}
									dangerouslySetInnerHTML={{ __html: 'Ctrl+&#8657+H' }}
								/>
							</>
						}
					>
						<span
							style={{
								width: 24,
								height: 24,
								boxSizing: 'border-box',
								padding: '3px 6px',
								fontSize: 16,
								borderRadius: 5,
								border: '1px solid #f3f4f5',
								color: colorState.color || null,
								backgroundColor: colorState.bgColor || null
							}}
						>
							A
						</span>
						<SvgArrowDown style={{ fontSize: 16, opacity: 0.5 }} />
					</IcoButton>

					<Divider
						orientation="vertical"
						variant="middle"
						flexItem
						sx={{ margin: '4px 6px' }}
					/>
					<IcoButton>
						<SvgMore />
					</IcoButton>
				</Box>
			);
		},
		slotProps: {
			paper: {
				sx: {
					marginBottom: '10px',
					marginLeft: '-1em',
					borderRadius: '8px'
				}
			}
		}
	});

	return instance;
};

let instance: ReturnType<typeof FloatBar> | undefined;
export const showFloatBar = (view: EditorView) => {
	if (!instance) instance = FloatBar(view);
	else instance.show();
};

export const closeFloatBar = () => {
	if (instance?.visible) instance.close();
};

export default FloatBar;
