import {
	createRoot,
	forwardRef,
	useImperativeHandle,
	useState
} from '@docucraft/srender';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';

const children = [];

const rootRender = createRoot();

interface DialogInstance {
	show(): void;
	close(): void;
}

const Confirm = forwardRef(
	(
		{
			onClose,
			onCancel,
			onOk
		}: { onClose: () => void; onOk: (e: any) => void; onCancel: () => void },
		ref: any
	) => {
		const [open, setOpen] = useState(false);
		const handleClickOpen = () => {
			setOpen(true);
		};

		const handleClose = () => {
			setOpen(false);
		};

		useImperativeHandle(ref, () => ({
			show: handleClickOpen,
			close: handleClickOpen
		}));
		return (
			<Dialog
				open={open}
				onClose={handleClose}
				PaperProps={{
					component: 'form',
					onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
						event.preventDefault();
						const formData = new FormData(event.currentTarget);
						const formJson = Object.fromEntries((formData as any).entries());
						const email = formJson.email;
						console.log(email);
						onOk(formJson);
						console.log(formData, formJson, 'jjj');

						handleClose();
					}
				}}
			>
				<DialogTitle>Subscribe</DialogTitle>
				<DialogContent>
					<DialogContentText>
						To subscribe to this website, please enter your email address here.
						We will send updates occasionally.
					</DialogContentText>
					<TextField
						autoFocus
						required
						margin="dense"
						id="name"
						name="email"
						label="Email Address"
						type="email"
						fullWidth
						variant="standard"
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose}>Cancel</Button>
					<Button type="submit">Subscribe</Button>
				</DialogActions>
			</Dialog>
		);
	}
);

let container: HTMLElement;

export function confirm() {
	let ref: DialogInstance | null = null;
	const { promise, resolve, reject } = Promise.withResolvers();
	if (!container) {
		container = document.createElement('div');
		document.body.appendChild(container);
	}
	rootRender.render(
		//@ts-ignore
		<Confirm onOk={resolve} ref={(e: DialogInstance) => (ref = e)} />,
		container
	);
	(ref as any)?.show();
	return promise;
}

// export function useDialog() {
// 	// const body = (

// 	// );

// 	const Confirm = () => {};

// 	const children = () => {};

// 	const dialog = {
// 		confirm() {},
// 		info() {},
// 		success() {},
// 		error() {}
// 	};

// 	return [dialog, body];
// }
