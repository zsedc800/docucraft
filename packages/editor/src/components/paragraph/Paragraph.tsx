import Typography from '@mui/material/Typography';
import { useNodeView } from '../../utils/view';
import { ParagraphView } from '.';
import Tools from '../toolBar/Tools';
interface Props {
	nodeView: ParagraphView;
	placeholder: string;
}

export default ({ nodeView, placeholder, ...props }: Props) => {
	const { $dom, $contentDOM } = useNodeView<HTMLDivElement>(nodeView);

	return (
		<Tools nodeView={nodeView}>
			<div ref={$dom} className="block text-block">
				<Typography
					className="paragraph"
					ref={$contentDOM}
					placeholder={placeholder}
					{...props}
				/>
			</div>
		</Tools>
	);
};
