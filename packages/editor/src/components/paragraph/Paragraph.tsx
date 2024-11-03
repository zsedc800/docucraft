import Typography from '@mui/material/Typography';
import { useNodeView } from '../../utils/view';
import { ParagraphView } from '.';
import Tools from '../toolBar/Tools';
import { styled } from '@mui/material/styles';
import Popper from '@mui/material/Popper';
import { useEffect, useState } from '@docucraft/srender';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Grid2 from '@mui/material/Grid2';
import Tooltip from '@mui/material/Tooltip';
import SvgTitle from '@docucraft/icons/svg/Title';
interface Props {
	nodeView: ParagraphView;
	placeholder: string;
	text?: string;
}

const StyledPopper = styled(Popper)(({ theme }) => ({
	border: `1px solid ${'#e1e4e8'}`,
	boxShadow: `0 8px 24px ${'rgba(149, 157, 165, 0.2)'}`,
	color: '#24292e',
	backgroundColor: '#fff',
	borderRadius: 6,
	width: 300,
	zIndex: theme.zIndex.modal,
	fontSize: 13,
	...theme.applyStyles('dark', {
		border: `1px solid ${'#30363d'}`,
		boxShadow: `0 8px 24px ${'rgb(1, 4, 9)'}`,
		color: '#c9d1d9',
		backgroundColor: '#1c2128'
	})
}));

export default ({ nodeView, placeholder, text = '', ...props }: Props) => {
	const { $dom, $contentDOM } = useNodeView<HTMLDivElement>(nodeView);
	const [anchorEl, setAnchorEl] = useState<HTMLElement>(null);
	const handleClose = () => {
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);
	const id = open ? 'block-control-panel' : void 0;
	useEffect(() => {
		if (/^\//.test(text)) {
			if (!open) setAnchorEl($dom.current);
		} else if (open) {
			handleClose();
		}
	}, [text]);
	return (
		<Tools nodeView={nodeView}>
			<div
				ref={$dom}
				className="block text-block"
				onChange={(e) => console.log(e, 'ert')}
			>
				<Typography
					className="paragraph"
					ref={$contentDOM}
					placeholder={placeholder}
					{...props}
				/>
				<StyledPopper id={id} open anchorEl={anchorEl} placement="bottom-start">
					<ClickAwayListener onClickAway={handleClose}>
						<Box
							className="scrollbar"
							sx={(t) => ({
								padding: '0 10px',
								'& .subTitle': {
									fontSize: '12px',
									paddingBottom: '4px',
									color: t.palette.text.secondary
								},
								'& .group': {
									padding: '8px 0'
								}
							})}
						>
							<Box
								className="group"
								sx={(t) => ({
									borderBottom: `1px solid ${t.palette.grey[100]}`
								})}
							>
								<Typography className="subTitle">最近使用</Typography>
								<Stack direction="row" spacing={1}>
									<Chip size="small" label="代码块"></Chip>
									<Chip size="small" label="任务列表"></Chip>
									<Chip size="small" label="表格"></Chip>
								</Stack>
							</Box>
							<Box className="group">
								<Typography className="subTitle">基础块</Typography>
								<Box sx={(t) => ({ display: 'grid' })}>
									<Tooltip title="x">
										<SvgTitle className="iconButton" />
									</Tooltip>
								</Box>
							</Box>
						</Box>
					</ClickAwayListener>
				</StyledPopper>
			</div>
		</Tools>
	);
};
