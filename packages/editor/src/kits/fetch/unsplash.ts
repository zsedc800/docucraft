import { QueryParams, QueryResult, get } from './base';

const access_key = 'lgNEmiYqxVGlcs6pkZIMA1n05IyWTLXL1BdUNpw_YnA';
const commonHeaders: [string, string][] = [
	['Authorization', `Client-ID ${access_key}`]
];

interface PageParams {
	page: number;
	query?: string;
	per_page?: number;
}

function mapToPageParams({ page, pageSize, query }: QueryParams) {
	return {
		page,
		query,
		per_page: pageSize
	};
}

export interface PhotoItemRes {
	id: string;
	width: number;
	height: number;
	color: string;
	alt_description: string;
	created_at: string;
	updated_at: string;
	urls: {
		raw: string;
		full: string;
		regular: string;
		small: string;
		thumb: string;
		small_s3: string;
	};
	user: {
		id: string;
		username: string;
		name: string;
	};
}

function getUnsplashApi<T>(path: string, params: Record<string, any>) {
	return get<T>(`https://api.unsplash.com${path}`, params, {
		headers: commonHeaders
	});
}

export const searchPhotos = async (params: QueryParams) => {
	return getUnsplashApi<QueryResult<PhotoItemRes>>(
		'/search/photos',
		mapToPageParams(params)
	);
};
