import Typography from '@mui/material/Typography';
import { useEffect } from '@docucraft/srender';
import { BaseNodeViewProps, useNodeView } from '../../utils/view';
import { ParagraphView } from './view';
import Tools from '../toolBar/Tools';
import { classnames } from '../../utils';
import { usePopover } from '../popover';
import { ComponentsPanel } from '../../kits/ComponentsPanel';
import './style.scss';
import { ColorPalette } from '../../kits/Button/OPMenus';

interface Props extends BaseNodeViewProps {
	nodeView: ParagraphView;
	placeholder: string;
	text?: string;
	initialPop?: boolean;
	blockId?: string;
}

export default ({
	nodeView,
	placeholder,
	initialPop,
	hidden,
	text = '',
	blockId,
	selected,
	color,
	bgColor
}: Props) => {
	const { $dom, $contentDOM } = useNodeView<HTMLDivElement>(nodeView);

	const [{ plain }, childrenHolder] = usePopover(nodeView.view);

	const isToplevel = nodeView.depth === 0;

	const poper = <ComponentsPanel close={plain.close} />;

	useEffect(() => {
		if (!isToplevel) return;
		if (initialPop) {
			plain(poper, () => nodeView.setNodeAttribute('initialPop', false));
		} else if (/^\//.test(text)) {
			if (!plain.visible) {
				plain(poper);
			}
		} else if (plain.visible) {
			plain.close();
		}
	}, [text]);

	const body = (
		<div
			ref={$dom}
			style={{ color, backgroundColor: bgColor }}
			className={classnames('block text-block', {
				hidden,
				empty: !text,
				initialPop,
				selected
			})}
			data-placeholder={placeholder}
			data-block-id={blockId}
		>
			<Typography className={classnames('paragraph')} ref={$contentDOM} />
		</div>
	);
	return (
		<>
			{childrenHolder}
			{isToplevel ? <Tools extraMenu={ColorPalette}>{body}</Tools> : body}
		</>
	);
};
