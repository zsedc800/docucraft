import { NodeSpec } from 'prosemirror-model';

export const taskItem: NodeSpec = {
	content: 'paragraph*',
	group: 'block',
	attrs: {
		checked: { default: false }
	},
	toDOM(node) {
		return [
			'li',
			{ class: 'task-item' },
			[
				'div',
				{ class: 'task-item-checkbox' },
				[
					'input',
					{
						type: 'checkbox',
						checked: node.attrs.checked ? 'checked' : null,
						contenteditable: 'false',
						tabindex: '-1'
					}
				]
			],
			['p', { class: 'task-item-content' }, 0]
		];
	},
	parseDOM: [
		{
			tag: 'li.task-list-item',
			getAttrs: (dom) => ({
				checked: dom.querySelector<HTMLInputElement>('input[type=checkbox]')
					?.checked
			})
		}
	]
};

export const taskList: NodeSpec = {
	content: 'taskItem+',
	group: 'block',
	toDOM: () => ['ul', { class: 'task-list' }, 0],
	parseDOM: [{ tag: 'ul.task-list' }]
};
