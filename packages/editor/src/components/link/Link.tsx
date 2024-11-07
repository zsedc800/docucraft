import Tooltip from '@mui/material/Tooltip';
import { AnchorHTMLAttributes } from 'react';
import { LinkView } from './view';
import { useNodeView } from '../../utils/view';
import Link from '@mui/material/Link';
interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
	nodeView: LinkView;
}
export default ({ nodeView, hidden, ...props }: Props) => {
	const { $dom, $contentDOM } = useNodeView<HTMLSpanElement, HTMLAnchorElement>(
		nodeView
	);

	return (
		<Tooltip title="w">
			<span ref={$dom}>
				<Link {...props} ref={$contentDOM} />
			</span>
		</Tooltip>
	);
};
