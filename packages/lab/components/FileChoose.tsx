import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
export default ({
	open,
	onChoose
}: {
	open: boolean;
	onChoose: () => void;
}) => {
	return (
		<Dialog open={open}>
			<Button onClick={onChoose}>创建一个文件</Button>
		</Dialog>
	);
};
