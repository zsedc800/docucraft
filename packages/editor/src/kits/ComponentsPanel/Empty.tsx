import SvgMangeSearch from '@docucraft/icons/svg/ManageSearch';
export default () => {
	return (
		<div className="empty" style={{ textAlign: 'center', color: '#999' }}>
			<div className="cover" style={{ fontSize: '80px', lineHeight: 1 }}>
				<SvgMangeSearch />
			</div>
			暂无搜索结果
		</div>
	);
};
