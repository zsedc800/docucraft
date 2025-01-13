import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import SvgUpload from '@docucraft/icons/svg/Upload';
import SvgSearch from '@docucraft/icons/svg/Search';
import BasicTabs, { TabChild } from './BasicTabs';
import { BaseForm } from '../../components/Form';
import { BaseNodeView } from '../../utils/view';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import useQuery from '../hooks/useQuery';
import { searchPhotos } from '../fetch/unsplash';
import LoadingBox from '../LoadingBox';
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

export default ({ nodeView }: { nodeView: BaseNodeView }) => {
	return (
		<BasicTabs style={{ minWidth: 500 }} defaultValue={1} dense align="center">
			<TabChild label="嵌入链接" value={1}>
				<BaseForm
					fields={[{ name: 'link', label: '链接' }]}
					onSubmit={(data) => {
						if (data.link) nodeView.setNodeAttribute('src', data.link);
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
				<SearchUnsplashImageList nodeView={nodeView} />
			</TabChild>
			{/* <TabChild label="" value={1}></TabChild> */}
		</BasicTabs>
	);
};

function SearchBox({
	placeholder = '搜索Unsplash图片',
	nodeView
}: {
	placeholder?: string;
	nodeView: BaseNodeView;
}) {
	const [{ results: photos = [] } = {}, { params, execQuery, loading }] =
		useQuery(searchPhotos, { query: '""', page: 1, pageSize: 30 });
	return (
		<div>
			<Box
				sx={(t) => ({
					display: 'flex',
					alignItems: 'center',
					borderRadius: t.shape.borderRadius,
					backgroundColor: 'grey.100',
					padding: '4px 8px',
					'& .icon': {
						fontSize: '20px',
						color: 'text.secondary',
						marginRight: 1
					}
				})}
			>
				<SvgSearch onClick={execQuery} className="icon" />
				<InputBase
					onKeyUp={(e) => {
						if (e.key === 'Enter') execQuery();
					}}
					onChange={(e) => (params.current.query = e.target.value)}
					placeholder={placeholder}
					inputProps={{ 'aria-label': '搜索图片' }}
				/>
			</Box>

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
									nodeView.setNodeAttribute('src', item.urls.regular)
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
		</div>
	);
}

function SearchUnsplashImageList({ nodeView }: { nodeView: BaseNodeView }) {
	// const [photos, setPhotos] = useState<PhotoItemRes[]>([]);
	// const searchVal = useRef<string>('');
	// useEffect(() => {
	// 	searchPhotos({ page: 1, query: '""', per_page: 30 }).then((res) => {
	// 		setPhotos(res.results);
	// 	});
	// }, []);
	return <SearchBox nodeView={nodeView} />;
}
