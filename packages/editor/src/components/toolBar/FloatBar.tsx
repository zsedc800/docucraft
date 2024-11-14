import { EditorView } from 'prosemirror-view';
import { basePop } from '../popover';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import FormatBold from '@docucraft/icons/svg/FormatBoldFill';
import FormatItalic from '@docucraft/icons/svg/FormatItalic';
import FormatUnderlined from '@docucraft/icons/svg/FormatUnderlined';
import Strikethrough from '@docucraft/icons/svg/StrikethroughS';
import SvgFunction from '@docucraft/icons/svg/Function';
import SvgLink from '@docucraft/icons/svg/Link';
import { NormalTooltip } from '../kits';
import { ReactNode } from 'react';
import { schema } from '../../model';
import { Attrs, MarkType } from 'prosemirror-model';
import { ButtonProps } from '@mui/material';

function IcoButton({
	children,
	title,
	onClick,
	color = 'inherit'
}: {
	children?: ReactNode;
	title?: ReactNode;
	onClick?: () => void;
	color?: ButtonProps['color'];
}) {
	return (
		<NormalTooltip title={title}>
			<IconButton
				size="small"
				onClick={onClick}
				color={color}
				sx={{ borderRadius: '5px', fontSize: '18px' }}
			>
				{children}
			</IconButton>
		</NormalTooltip>
	);
}

const boldMark = 1;
const italicMark = 2;
const underlineMark = 4;
const strikethroughMark = 8;

const FloatBar = (view: EditorView) => {
	const { bold, italic, underline, linethrough } = schema.marks;
	const map = new Map<MarkType, number>([
		[bold, boldMark],
		[italic, italicMark],
		[underline, underlineMark],
		[linethrough, strikethroughMark]
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

			if (mark)
				doc.nodesBetween(from, to, (node, pos) => {
					if (node.isText) {
						let m = 0;
						node.marks.forEach((item) => {
							const mask = map.get(item.type);
							if (mask) m |= mask;
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
			return (
				<Box sx={{ padding: '2px 5px', color: '#000' }}>
					<IcoButton
						color={getMask(boldMark)}
						onClick={createAction(bold, boldMark)}
					>
						<FormatBold />
					</IcoButton>
					<IcoButton
						color={getMask(italicMark)}
						onClick={createAction(italic, italicMark)}
					>
						<FormatItalic />
					</IcoButton>
					<IcoButton
						color={getMask(underlineMark)}
						onClick={createAction(underline, underlineMark)}
					>
						<FormatUnderlined />
					</IcoButton>
					<IcoButton
						color={getMask(strikethroughMark)}
						onClick={createAction(linethrough, strikethroughMark)}
					>
						<Strikethrough />
					</IcoButton>
					<IcoButton>
						<SvgFunction />
					</IcoButton>
					<IcoButton>
						<SvgLink />
					</IcoButton>
				</Box>
			);
		},
		slotProps: {
			paper: {
				sx: {
					marginBottom: '10px',
					marginLeft: '-1em'
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
	instance?.close();
};

export default FloatBar;
