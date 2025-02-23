import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import SvgUpload from '@docucraft/icons/svg/Upload';
import BasicTabs, { TabChild } from '../Tabs';
import { BaseForm } from '../../components/Form';
import useQuery from '../hooks/useQuery';
import { searchPhotos } from '../fetch/unsplash';
import LoadingBox from '../LoadingBox';
import SearchBox from '../SearchBox';
import { ImageItem } from '../../interface';

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

type OnChange = (img: ImageItem, extra?: any) => void;

export default ({ onChange }: { onChange?: OnChange }) => {
	return (
		<BasicTabs
			style={{ minWidth: 500 }}
			defaultValue={1}
			dense
			align="center"
			slotProps={{ tabContent: { style: { padding: '8px' } } }}
		>
			<TabChild label="嵌入链接" value={1}>
				<BaseForm
					fields={[{ name: 'link', label: '链接' }]}
					onSubmit={({ link }) => {
						if (!link) return;
						if (onChange) onChange({ src: link });
					}}
				>
					<Button
						size="small"
						variant="contained"
						style={{ display: 'flex', width: 240, margin: '10px auto' }}
						type="submit"
					>
						嵌入链接
					</Button>
				</BaseForm>
			</TabChild>
			<TabChild label="上传图片" value={2}>
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
						点击上传图片
						<VisuallyHiddenInput
							type="file"
							onChange={(event) => console.log(event.target.files)}
						/>
					</Button>
				</div>
			</TabChild>
			<TabChild label="Unsplash" value={3}>
				<SearchUnsplashImageList onChange={onChange} />
			</TabChild>
			{/* <TabChild label="" value={1}></TabChild> */}
		</BasicTabs>
	);
};

function SearchUnsplashImageList({ onChange }: { onChange?: OnChange }) {
	const [{ results: photos = [] } = {}, { params, execQuery, loading }] =
		useQuery(searchPhotos, { query: '""', page: 1, pageSize: 30 });
	return (
		<SearchBox
			onChange={(q) => (params.current.query = q)}
			onSearch={execQuery}
			placeholder="搜索Unsplash图片"
		>
			<LoadingBox
				loading={loading}
				className="scrollbar"
				style={{ height: 380, width: 500, margin: '10px 0' }}
			>
				<ImageList cols={3} rowHeight={138}>
					{photos.map((item) => {
						return (
							<ImageListItem
								style={{ overflow: 'hidden' }}
								onClick={() =>
									onChange && onChange({ src: item.urls.regular }, item)
								}
							>
								<img
									alt={item.alt_description}
									src={item.urls.thumb}
									loading="lazy"
								/>
								<ImageListItemBar
									subtitle={<span>by: {item.user.name}</span>}
								/>
							</ImageListItem>
						);
					})}
				</ImageList>
			</LoadingBox>
		</SearchBox>
	);
}
