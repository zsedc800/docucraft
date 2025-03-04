import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import { IconBlock } from '../IconBlock';
import { basicBlocks, blocks } from './menuItemConfig';
import { onTrigger } from './utils';
import { BaseNodeView } from '../../utils/view';
import { classnames } from '../../utils';
import { BaseProps } from '../../interface';
interface Props extends BaseProps {
	nodeView: BaseNodeView;
	close?: () => void;
}
export default ({ nodeView, close, ...props }: Props) => {
	const { node } = nodeView;
	return (
		<Box {...props}>
			<Box
				sx={(t) => ({
					display: 'grid',
					padding: '8px 16px 0',
					gridTemplateColumns: 'repeat(6, 1fr)',
					gap: '4px',
					'& .iconButton': {
						fontSize: '24px'
					}
				})}
			>
				{basicBlocks.map((props) => {
					const name =
						node.type.name === 'heading'
							? `h${node.attrs.level}`
							: node.type.name;
					return (
						<IconBlock
							{...{ ...(props as any), handleClose: close }}
							className={classnames({
								selected: props.name === name
							})}
						/>
					);
				})}
			</Box>
			<List dense style={{ paddingTop: 0 }}>
				{blocks.map(
					({ type, handler, title, cover: Cover, description, blockType }) => (
						<ListItem
							onClick={() => {
								onTrigger(nodeView, { type, handler });
								close && close();
							}}
						>
							<ListItemButton
								tabindex={null}
								className={classnames({
									selected: blockType === node.type.name
								})}
							>
								<ListItemAvatar>
									<Avatar className="avatar" variant="rounded">
										<Cover />
									</Avatar>
								</ListItemAvatar>
								<ListItemText primary={title} secondary={description} />
							</ListItemButton>
						</ListItem>
					)
				)}
			</List>
		</Box>
	);
};
