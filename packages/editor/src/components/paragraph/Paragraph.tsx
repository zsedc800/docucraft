import Typography from '@mui/material/Typography';
import { useEffect } from '@docucraft/srender';
import { BaseNodeViewProps, useNodeView } from '../../utils/view';
import { ParagraphView } from '.';
import Tools from '../toolBar/Tools';
import { classnames } from '../../utils';
import { usePopover } from '../popover';
import { ComponentsPanel } from '../../kits/ComponentsPanel';

interface Props extends BaseNodeViewProps {
	nodeView: ParagraphView;
	placeholder: string;
	text?: string;
	initialPop?: boolean;
}

export default ({
	nodeView,
	placeholder,
	initialPop,
	hidden,
	text = ''
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
			className={classnames('block text-block', {
				hidden,
				empty: !text,
				initialPop
			})}
			data-placeholder={placeholder}
		>
			<Typography className={classnames('paragraph')} ref={$contentDOM} />
		</div>
	);
	return (
		<>
			{childrenHolder}
			{isToplevel ? <Tools>{body}</Tools> : body}
		</>
	);
};
