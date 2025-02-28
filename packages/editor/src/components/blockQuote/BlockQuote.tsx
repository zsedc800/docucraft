import { Overrides } from '../../interface';
import { classnames } from '../../utils';
import { BaseNodeViewProps, useNodeView } from '../../utils/view';
import Tools from '../toolBar/Tools';
import { BlockQuoteView } from './view';

type Props = Overrides<
	BaseNodeViewProps,
	{
		nodeView: BlockQuoteView;
	}
>;

export default ({ nodeView, selected, color, bgColor }: Props) => {
	const { $dom } = useNodeView<HTMLQuoteElement>(nodeView);
	const body = (
		<blockquote
			ref={$dom}
			style={{ color, backgroundColor: bgColor }}
			className={classnames('blockQuote', { selected })}
		/>
	);
	return <Tools>{body}</Tools>;
};
