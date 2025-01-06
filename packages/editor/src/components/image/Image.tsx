import Paper from '@mui/material/Paper';
import { BaseNodeView, nodeViewContext, useNodeView } from '../../utils/view';
import { ImageNodeView } from './view';
import Menu from '../../kits/Menu';
import {
	CSSProperties,
	useContext,
	useEffect,
	useRef,
	useState
} from '@docucraft/srender';
import { AlignButton } from '../../kits/Button';
import Divider from '@mui/material/Divider';
import SvgLink from '@docucraft/icons/svg/Link';
import SvgArrowsOutward from '@docucraft/icons/svg/ArrowsOutward';
import SvgMore from '@docucraft/icons/svg/More1';
import { ToggleButton, ToggleButtonGroup } from '../../kits/ToggleButton';
import Box from '@mui/material/Box';
import { setStyles } from '../../utils/domUtils';
interface Props {
	title: string;
	alt: string;
	src: string;
	srcSet: string;
	loading: 'lazy' | 'eager';
	nodeView: ImageNodeView;
	link: string;
	width: number;
}

interface ImageToolsProps {}

function ImageTools() {
	const { nodeView } = useContext(nodeViewContext);
	return (
		<Paper
			style={{
				display: 'flex',
				padding: '2px',
				marginBottom: 12,
				fontSize: '16px'
			}}
		>
			<ToggleButton
				title="自适应宽高"
				onClick={() => nodeView.setNodeAttribute('width', 'auto')}
			>
				<SvgArrowsOutward />
			</ToggleButton>
			<Divider orientation="vertical" flexItem variant="middle" />
			<ToggleButton>
				<SvgLink style={{ transform: 'rotateZ(-45deg)' }} />
			</ToggleButton>
			<Divider orientation="vertical" flexItem variant="middle" />
			<AlignButton />
			<Divider orientation="vertical" flexItem variant="middle" />
			<ToggleButton>
				<SvgMore />
			</ToggleButton>
		</Paper>
	);
}

type Placement = 'tl' | 'tr' | 'bl' | 'br';
function initResizer(box: HTMLElement, nodeView: BaseNodeView) {
	let dragging = false;
	const text = box.querySelector('.text') as HTMLElement;
	const { setNodeAttribute } = nodeView;
	function handleMouseDown(placement: Placement) {
		const win = box.ownerDocument.defaultView ?? window;
		let boxStyle: CSSProperties = {};
		const { width, height, x, y } = box.getBoundingClientRect();
		switch (placement) {
			case 'tl':
				boxStyle = { left: 0, top: 0 };
				break;
			case 'tr':
				boxStyle = { top: 0, right: 0 };
				break;
			case 'bl':
				boxStyle = { left: 0, bottom: 0 };
				break;
			case 'br':
				boxStyle = { right: 0, bottom: 0 };
		}

		let w = width,
			h = height;
		dragging = true;
		box.classList.add('dragging');
		console.log('mousedown');

		function move(e: MouseEvent) {
			if (!e.buttons) return finish();

			if (!dragging) return;
			const { clientX } = e;
			if (placement === 'br') {
				w = clientX - x;
			}
			h = Math.round(w * (height / width));
			setStyles(box, {
				...boxStyle,
				width: w,
				height: h
			});
			text.textContent = `${Math.round(w)} x ${h}`;
		}

		function finish() {
			win.removeEventListener('mousemove', move);
			win.removeEventListener('mouseup', finish);
			if (dragging) {
				dragging = false;
				box.classList.remove('dragging');
				setNodeAttribute('width', w);
			}
		}

		win.addEventListener('mousemove', move);
		win.addEventListener('mouseup', finish);
	}
	function onMouseDown(e: MouseEvent) {
		const placement = (e.target as HTMLElement)?.getAttribute('data-placement');
		if (placement) handleMouseDown(placement as Placement);
	}
	box.addEventListener('mousedown', onMouseDown);
}

function ResizeBar({ nodeView }: { nodeView: BaseNodeView }) {
	const resizeBox = useRef<HTMLDivElement>(null);
	useEffect(() => {
		resizeBox.current && initResizer(resizeBox.current, nodeView);
	}, []);
	return (
		<div ref={resizeBox} className="resizer-box">
			<div data-placement="tl" className="resizer resizer-tl"></div>
			<div data-placement="tr" className="resizer resizer-tr"></div>
			<div data-placement="bl" className="resizer resizer-bl"></div>
			<div data-placement="br" className="resizer resizer-br"></div>
			<span className="text"></span>
		</div>
	);
}

export default ({
	title,
	src,
	srcSet,
	nodeView,
	loading,
	link,
	width
}: Props) => {
	const { $dom } = useNodeView(nodeView);
	const $img = useRef<HTMLImageElement>(null);
	let image = <img ref={$img} src={src} loading={loading} title={title} />;
	if (link) image = <a href={link}>{image}</a>;
	const [actived, setActived] = useState(false);
	useEffect(() => {
		$dom.current?.addEventListener('dragstart', (e) => {
			e.preventDefault();
			// e.stopPropagation();
		});
	}, []);
	return (
		<div ref={$dom}>
			<Menu
				placement="top-end"
				content={<ImageTools />}
				onOpen={() => setActived(true)}
				onClose={() => setActived(false)}
			>
				<div className="image-wrapper">
					<Paper style={{ width }} className="image-box">
						{image}
					</Paper>
					{actived && <ResizeBar nodeView={nodeView} />}
				</div>
			</Menu>
		</div>
	);
};
