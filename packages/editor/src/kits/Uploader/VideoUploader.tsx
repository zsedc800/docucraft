import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import SvgUpload from '@docucraft/icons/svg/Upload';
import BasicTabs, { TabChild } from './BasicTabs';
import { BaseForm } from '../../components/Form';

const VisuallyHiddenInput = styled('input')({
	clip: 'rect(0 0 0 0)',
	clipPath: 'inset(50%)',
	height: 1,
	overflow: 'hidden',
	position: 'absolute',
	bottom: 0,
	left: 0,
	whiteSpace: 'nowrap',
	width: 1
});

type OnChange = (src: string, extra?: any) => void;

export default ({ onChange }: { onChange?: OnChange }) => {
	return (
		<BasicTabs style={{ minWidth: 500 }} defaultValue={1} dense align="center">
			<TabChild label="嵌入链接" value={1}>
				<BaseForm
					fields={[{ name: 'link', label: '链接' }]}
					onSubmit={({ link }) => {
						if (!link) return;
						if (onChange) onChange(link);
					}}
				>
					<Button
						size="small"
						variant="contained"
						style={{ display: 'flex', width: 240, margin: '10px auto' }}
						type="submit"
					>
						嵌入视频
					</Button>
					<Typography variant="body2" color="text.secondary" align="center">
						支持youtube、bilibili网页链接
					</Typography>
				</BaseForm>
			</TabChild>
			<TabChild label="上传" value={2}>
				<div style={{ padding: '10px 0' }}>
					<Button
						component="label"
						role={void 0}
						size="small"
						fullWidth
						variant="contained"
						tabIndex={-1}
						startIcon={<SvgUpload />}
					>
						点击上传视频
						<VisuallyHiddenInput
							type="file"
							onChange={(event) => console.log(event.target.files)}
						/>
					</Button>
				</div>
			</TabChild>
		</BasicTabs>
	);
};
