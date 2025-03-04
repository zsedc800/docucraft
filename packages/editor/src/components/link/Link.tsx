import { AnchorHTMLAttributes } from 'react';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import { NodeSelection } from 'prosemirror-state';
import { Fragment, Slice } from 'prosemirror-model';
import SvgEdit from '@docucraft/icons/svg/Edit';
import SvgOpenInNew from '@docucraft/icons/svg/OpenInNewFill';
import SvgCopy from '@docucraft/icons/svg/ContentCopy';
import SvgLinkOff from '@docucraft/icons/svg/LinkOffFill';
import { LinkView } from './view';
import { BaseNodeView, useNodeView } from '../../utils/view';
import { IconBlock, RichTooltip } from '../../kits';
import { prompt } from '../popover';
import { schema } from '../../model';
import Toast from '../Toast';
import { createNode } from '../../commands';
import { classnames, nextTick } from '../../utils';
import { BlockItem } from '../../kits/ComponentsPanel';
interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
	nodeView: LinkView;
}

const tools: Omit<BlockItem, 'name' | 'blockType'>[] = [
	{
		title: '访问链接',
		icon: SvgOpenInNew,
		type: 'inline',
		handler: ({ node }: BaseNodeView) => {
			window.open(node.attrs.href, node.attrs.target);
		}
	},
	{
		title: '编辑链接',
		icon: SvgEdit,
		type: 'inline',
		handler: async ({ getPos, view, node }: BaseNodeView) => {
			const pos = getPos();
			const { state, dispatch } = view;
			if (pos || pos === 0) {
				let tr = state.tr.setSelection(NodeSelection.create(state.doc, pos));
				dispatch(tr);
				await nextTick();

				const { text, url } = await prompt(
					{
						title: '编辑链接',
						fields: [
							{
								name: 'url',
								label: '链接',
								required: true,
								defaultValue: node.attrs.href
							},
							{ name: 'text', label: '文本', defaultValue: node.textContent }
						]
					},
					view
				);
				view.dispatch(
					view.state.tr.replaceSelection(
						new Slice(
							Fragment.from(
								createNode(
									schema.nodes.link,
									{ ...node.attrs, href: url },
									schema.text(text)
								)
							),
							0,
							0
						)
					)
				);
			}
		}
	},
	{
		title: '复制链接',
		type: 'inline',
		icon: SvgCopy,
		handler: ({ node }: BaseNodeView) => {
			navigator.clipboard
				.writeText(node.attrs.href)
				.then(() => Toast.success('已复制'));
		}
	},
	{
		title: '取消链接',
		icon: SvgLinkOff,
		type: 'inline',
		handler: ({ node, getPos, view }: BaseNodeView) => {
			const pos = getPos();
			const { state, dispatch } = view;
			if (pos || pos === 0) {
				dispatch(
					state.tr.replaceWith(
						pos,
						pos + node.nodeSize,
						schema.text(node.textContent)
					)
				);
			}
		}
	}
];

const LinkTools = () => {
	return (
		<Paper
			sx={{
				fontSize: '18px',
				padding: '2px 8px',
				display: 'flex',
				'& .iconButton': {
					padding: '4px',
					boxSizing: 'content-box'
				}
			}}
		>
			{tools.map((item) => (
				<IconBlock {...(item as any)} />
			))}
		</Paper>
	);
};

export default ({ nodeView, hidden, href }: Props) => {
	const { $dom, $contentDOM } = useNodeView<HTMLSpanElement, HTMLAnchorElement>(
		nodeView
	);
	return (
		<RichTooltip
			title={<LinkTools />}
			slotProps={{ tooltip: { className: 'richTooltip' } }}
			placement="bottom-start"
		>
			<Link
				className={classnames({ hidden })}
				aria-labelledby="tooltip"
				href={href}
				ref={(node) => {
					$dom.current = node;
					$contentDOM.current = node;
				}}
			/>
		</RichTooltip>
	);
};
