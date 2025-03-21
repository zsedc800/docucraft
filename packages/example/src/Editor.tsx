import { MindMap } from '@docucraft/mindmap';
import { useEffect } from '@docucraft/srender';
export default () => {
	useEffect(() => {
		const mind = new MindMap('mind');

		// mind.parseJSON({
		// 	rootTopic: {
		// 		title: '思维导图',
		// 		children: {
		// 			attached: [
		// 				{
		// 					title: 'node',
		// 					children: {
		// 						attached: [
		// 							{
		// 								title: 'node'
		// 							}
		// 						]
		// 					}
		// 				},
		// 				{
		// 					title: 'node',
		// 					children: {
		// 						attached: [
		// 							{
		// 								title: 'node',
		// 								children: {
		// 									attached: [
		// 										{
		// 											title: 'node',
		// 											children: {
		// 												attached: [
		// 													{
		// 														title: 'node'
		// 													}
		// 												]
		// 											}
		// 										},
		// 										{
		// 											title: 'node',
		// 											children: {
		// 												attached: [
		// 													{
		// 														title: 'node'
		// 													}
		// 												]
		// 											}
		// 										}
		// 									]
		// 								}
		// 							}
		// 						]
		// 					}
		// 				},
		// 				{
		// 					title: 'node'
		// 				},
		// 				{
		// 					title: 'node'
		// 				},
		// 				{
		// 					title: 'node'
		// 				},
		// 				{
		// 					title: 'node'
		// 				}
		// 			]
		// 		}
		// 	}
		// } as any);
		return () => {
			mind.destroy();
		};
	}, []);
	return (
		<main>
			<h1>hello</h1>
			<div id="mind" style={{ height: 1000 }} className="container"></div>
		</main>
	);
};
