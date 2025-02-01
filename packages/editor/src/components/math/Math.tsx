import katex from 'katex';
import { BaseNodeView, useNodeView } from '../../utils/view';
import Tools from '../toolBar/Tools';
import './style.scss';
import { useEffect } from '@docucraft/srender';
import Menu from '../../kits/Menu';

interface Props {
	formula: string;
	nodeView: BaseNodeView;
}

export const MathBlockNode = ({ formula, nodeView }: Props) => {
	const { $dom } = useNodeView(nodeView);
	const body = <div ref={$dom} className="math-block-node"></div>;
	return <Tools>{body}</Tools>;
};

export const MathInlineNode = ({ formula, nodeView }: Props) => {
	const { $dom } = useNodeView<HTMLSpanElement>(nodeView);
	useEffect(() => {
		katex.render(formula, $dom.current);
	}, [formula]);
	const body = <span ref={$dom} className="math-inline-node"></span>;
	return <Menu trigger="click">{body}</Menu>;
};
