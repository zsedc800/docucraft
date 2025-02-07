import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';

const RTooltip = styled(({ className, ...props }: TooltipProps) => (
	<Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
	[`&  .${tooltipClasses.tooltip}.richTooltip`]: {
		backgroundColor: 'transparent',
		color: 'rgba(0, 0, 0, 0.87)',
		fontSize: theme.typography.pxToRem(14),
		border: 'none',
		padding: '0 0 0 0',
		margin: '1px 0 0 0'
	}
}));

export const RichTooltip = (props: TooltipProps) => <RTooltip {...props} />;

const NTooltip = styled(({ className, ...props }: TooltipProps) => (
	<Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
	[`& .${tooltipClasses.tooltip}`]: {
		backgroundColor: theme.palette.common.black,
		fontSize: 14
	},
	'& p': {
		fontSize: 14
	}
}));

export const NormalTooltip = (props: TooltipProps) => <NTooltip {...props} />;
