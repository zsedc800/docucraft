interface RenderInfo {
	from: number;
	to: number;
	classNames: string[];
	scope: string;
}

export class HighlightRenderer {
	// 当前位置
	private currentPos: number;
	// 最终匹配好的所有 renderInfo
	private finishedRenderInfos: RenderInfo[] = [];
	// 正在进行加了 from 没有加 to 的这些，会一次入栈
	private trackingRenderInfoStack: RenderInfo[] = [];
	// 这里是 hljs-，是从 _emitter.options.classPrefix 获取的
	private classPrefix: string;

	constructor(tree: any, blockStartPos: number) {
		// 这里实例化的时候直接记录初始位置，这里开始的位置是 code_block 开始位置 + 1,原因是还是之前的 node 坐标系统，
		// 具体的文本是 <code_block>keyword 这样的，在 code_block 标签后面开始的，code_block开始位置是标签之前
		this.currentPos = blockStartPos + 1;
		this.classPrefix = tree.options.classPrefix;

		// 直接开始遍历
		tree.walk(this);
	}

	// add Text 就开始更新位置
	addText(text: string) {
		console.log(text, 'text');

		if (text) {
			this.currentPos += text.length;
		}
	}

	// open 时候就创建 render Info，并入栈
	openNode(node: any) {
		// node.scope is className
		console.log(node, 'node');

		if (!node.scope) return;

		// create new render info, which corresponds to HTML open tag.
		const renderInfo = this.newRenderInfo({
			from: this.currentPos,
			classNames: node.scope
				.split('.')
				.filter((item: any) => item)
				.map((item: string) => this.classPrefix + item),
			scope: node.scope
		});

		// push tracking stack
		this.trackingRenderInfoStack.push(renderInfo);
	}

	// close 就出栈补充 to 信息，补充完丢带完成的数组中
	closeNode(node: { scope: string }) {
		if (!node.scope) return;
		const renderInfo = this.trackingRenderInfoStack.pop();
		if (!renderInfo)
			throw new Error('[highlight-code-plugin-error]: Cannot close node!');

		if (node.scope !== renderInfo.scope)
			throw new Error('[highlight-code-plugin-error]: Matching error!');

		renderInfo.to = this.currentPos;

		// finish a render info, which corresponds to html close tag.
		this.finishedRenderInfos.push(renderInfo);
	}

	// 快捷的创建 renderINfo 的辅助方法
	newRenderInfo(info: Partial<RenderInfo>): RenderInfo {
		return {
			from: this.currentPos,
			to: -1,
			classNames: [],
			scope: '',
			...info
		};
	}

	// 获取 value
	get value() {
		return this.finishedRenderInfos;
	}
}
