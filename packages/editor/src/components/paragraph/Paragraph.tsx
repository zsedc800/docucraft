import Typography from '@mui/material/Typography';
import { useEffect, useRef } from '@docucraft/srender';
import { BaseNodeViewProps, useNodeView } from '../../utils/view';
import { ParagraphView } from './view';
import Tools from '../toolBar/Tools';
import { classnames } from '../../utils';
import { useViewBoard } from '../popover';
import { ComponentsPanel } from '../../kits/ComponentsPanel';
import { ColorPalette } from '../../kits/Button/OPMenus';
import './style.scss';

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
	hidden,
	text = '',
	blockId,
	selected,
	color,
	bgColor,
	initialPop
}: Props) => {
	const { $dom, $contentDOM } = useNodeView<HTMLDivElement>(nodeView);

	const [{ open, close }, childrenHolder] = useViewBoard(
		nodeView.view,
		({ close }) => <ComponentsPanel text={text} close={close} />,
		() => {
			if (initialPop) nodeView.setNodeAttribute('initialPop', false);
		}
	);

	const isToplevel = nodeView.depth === 0;

	useEffect(() => {
		if (!isToplevel) return;
		if (initialPop) {
			open();
		} else if (/^\//.test(text)) {
			open();
		} else {
			close();
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
