import { AnchorHTMLAttributes } from 'react';
import { LinkView } from './view';
import { BaseNodeView, useNodeView } from '../../utils/view';
import Link from '@mui/material/Link';
import { IconBlock, RichTooltip } from '../../kits';
import SvgEdit from '@docucraft/icons/svg/Edit';
import SvgOpenInNew from '@docucraft/icons/svg/OpenInNewFill';
import SvgCopy from '@docucraft/icons/svg/ContentCopy';
import SvgLinkOff from '@docucraft/icons/svg/LinkOffFill';
import Paper from '@mui/material/Paper';
import { NodeSelection } from 'prosemirror-state';
import { prompt } from '../popover';
import { Fragment, Slice } from 'prosemirror-model';
import { schema } from '../../model';
import Toast from '../Toast';
import { createNode } from '../../commands';
import { classnames, nextTick } from '../../utils';
import { ToolItem } from 'src/kits/ComponentsPanel';
interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
	nodeView: LinkView;
}

const tools: ToolItem[] = [
	{
		title: '访问链接',
		icon: SvgOpenInNew,
		handler: ({ node }: BaseNodeView) => {
			window.open(node.attrs.href, node.attrs.target);
		}
	},
	{
		title: '编辑链接',
		icon: SvgEdit,
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
					padding: '4px'
				}
			}}
		>
			{tools.map((item) => (
				<IconBlock {...item} />
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
