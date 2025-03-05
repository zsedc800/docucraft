import { MindRoot } from './interface';

export class Mind {
	data: MindRoot;
	constructor() {
		this.data = {
			title: '我的思维导图',
			topics: [],
			theme: ''
		};
	}

	render() {}

	destroy() {}
}
