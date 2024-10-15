import {
	useEffect,
	useLayoutEffect,
	useRef,
	useState
} from '@docucraft/srender';
import Icon from '@docucraft/icons';
import '@docucraft/icons/styles';
import { HeadingView } from '.';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
export type Level = 1 | 2 | 3 | 4 | 5 | 6;
export interface Props {
	view: HeadingView;
	level: Level;
	fold: boolean;
	hidden: boolean;
	id: string;
}

function BasicPopover() {
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

	const handleClick = (event: Event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);
	const id = open ? 'simple-popover' : undefined;
	const ref = useRef<HTMLButtonElement>();

	useEffect(() => {}, []);
	return (
		<>
			<Button
				ref={ref}
				aria-describedby={id}
				variant="contained"
				onClick={handleClick as any}
			>
				Open Popover
			</Button>
			<Popover
				id={id}
				open={open}
				anchorEl={anchorEl}
				onClose={handleClose}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'left'
				}}
			>
				{
					(
						<Typography sx={{ p: 2 }}>The content of the Popover.</Typography>
					) as any
				}
			</Popover>
		</>
	);
}

export default ({ view, level, fold, hidden, id }: Props) => {
	const $heading = useRef<HTMLElement>();
	const $content = useRef<HTMLDivElement>();
	const outlineTree = view.outlineTree;
	useLayoutEffect(() => {
		if ($heading.current) view.dom = $heading.current;
		view.contentDOM = $content.current;
	}, []);
	const Tag = `h${level}`;

	return (
		<Tag ref={$heading} id={id} className={`heading ${hidden ? 'hidden' : ''}`}>
			<div className="heading-tools" contentEditable="false">
				<Icon
					className="toggle-button"
					name={fold ? 'arrow_drop_down' : 'arrow_right'}
					onClick={() => {
						const pos = view.getPos();

						let tr = view.view.state.tr.setMeta('toggleHeading', {
							hidden: !fold,
							pos
						});

						if (typeof pos !== 'undefined')
							tr = tr.setNodeMarkup(pos, null, {
								...view.node.attrs,
								fold: !fold
							});
						view.view.dispatch(tr);
					}}
				/>
				<BasicPopover />
			</div>
			{outlineTree && outlineTree.orderType ? (
				<>
					<span
						className="list-symbol"
						data-type={outlineTree.orderType}
						data-level={outlineTree.dataLevel(view.id)}
						contentEditable="false"
					>
						{outlineTree.calculateOrderNumber(view.id)}
					</span>
				</>
			) : null}
			<div ref={$content} className="heading-content"></div>
		</Tag>
	);
};
