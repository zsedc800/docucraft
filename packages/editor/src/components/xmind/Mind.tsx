import { useEffect, useRef } from '@docucraft/srender';
import Paper from '@mui/material/Paper';
import { BaseNodeViewProps, useNodeView } from '../../utils/view';
import { XMindView } from './view';
import { Tools } from '../toolBar';
import './style.scss';

interface Props extends BaseNodeViewProps {
	nodeView: XMindView;
	blockId: string;
}
export default ({ nodeView, blockId }: Props) => {
	const { $dom } = useNodeView(nodeView);
	const canvas = useRef<HTMLDivElement>(null);
	useEffect(() => {
		let mind,
			isDestroy = false;

		import('./mind').then(({ Mind }) => {
			if (isDestroy) return;
			mind = new Mind(canvas.current);
			mind.parseJSON({
				rootTopic: {
					title: '思维导图',
					children: {
						attached: [
							{
								title: 'node',
								children: {
									attached: [
										{
											title: 'node'
										}
									]
								}
							},
							{
								title: 'node',
								children: {
									attached: [
										{
											title: 'node',
											children: {
												attached: [
													{
														title: 'node',
														children: {
															attached: [
																{
																	title: 'node'
																}
															]
														}
													},
													{
														title: 'node',
														children: {
															attached: [
																{
																	title: 'node'
																}
															]
														}
													}
												]
											}
										}
									]
								}
							},
							{
								title: 'node'
							},
							{
								title: 'node'
							},
							{
								title: 'node'
							},
							{
								title: 'node'
							}
						]
					}
				}
			} as any);
		});
		return () => {
			mind?.destroy();
			isDestroy = true;
		};
	}, []);
	return (
		<Tools>
			<div id={blockId} className="Mindmap" ref={$dom}>
				<Paper ref={canvas} className="canvas" style={{ height: 500 }} />
			</div>
		</Tools>
	);
};
