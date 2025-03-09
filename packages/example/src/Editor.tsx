import { Mind } from '@docucraft/editor/src/components/xmind/mind';
import { useEffect } from '@docucraft/srender';
export default () => {
	useEffect(() => {
		const mind = new Mind('mind');
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
		return () => {
			mind.destroy();
		};
	}, []);
	return (
		<main>
			<h1>hello</h1>
			<div id="mind" style={{ height: 800 }} className="container"></div>
		</main>
	);
};
