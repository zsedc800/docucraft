import { createRoot } from '@docucraft/srender';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';

interface BaseOpts {
	duration?: number;
	vertical?: 'top' | 'bottom';
	horizontal?: 'left' | 'center' | 'right';
}

const basePop = (
	children: any,
	{ duration = 1200, vertical = 'top', horizontal = 'center' }: BaseOpts = {}
) => {
	const container = document.createElement('div');
	document.body.appendChild(container);

	const rootRender = createRoot();
	const render = (open = true) => {
		rootRender.render(
			<Snackbar
				open={open}
				autoHideDuration={duration}
				onClose={() => render(false)}
				anchorOrigin={{ vertical, horizontal }}
				TransitionComponent={Slide}
			>
				{children}
			</Snackbar>,
			container
		);
	};

	render();
	return [
		{ close: () => render(false) },
		() => {
			rootRender.unmount();
			container.parentNode?.removeChild(container);
		}
	] as const;
};

export const info = () => {};

export const success = (msg: string, opts: BaseOpts = {}) => {
	const [{ close }, destroy] = basePop(
		<Alert onClose={() => close()} severity="success" sx={{ width: '100%' }}>
			{msg}
		</Alert>,
		opts
	);
	return destroy;
};

export const warn = () => {};

export const error = () => {};
