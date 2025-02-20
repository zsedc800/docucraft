import { useNodeView } from '../../utils/view';
import Tools from '../toolBar/Tools';
import { BlockQuoteView } from './view';

interface Props {
	nodeView: BlockQuoteView;
}

export default ({ nodeView }: Props) => {
	const { $dom } = useNodeView<HTMLQuoteElement>(nodeView);
	const body = <blockquote ref={$dom} />;
	return <Tools>{body}</Tools>;
};
