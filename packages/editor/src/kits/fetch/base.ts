export interface QueryParams {
	page: number;
	pageSize?: number;
	query?: string;
}

export interface QueryResult<T> {
	total: number;
	results: T[];
}

export interface JsonResponse<T> {
	success: boolean;
	message?: string;
	code?: number;
	data: T;
}

export async function get<T>(
	url: string,
	params: Record<string, any> = {},
	{ headers, ...options }: Partial<RequestInit> = {}
) {
	let entries: [string, string][] = [];
	if (headers instanceof Headers)
		for (const item of headers.entries()) entries.push(item);
	else if (Array.isArray(headers)) entries = entries.concat(headers);
	else if (headers)
		for (const key of Object.keys(headers)) entries.push([key, headers[key]]);

	const qs = new URLSearchParams(params).toString();
	const res = await fetch(url.includes('?') ? url + '&' + qs : url + '?' + qs, {
		method: 'GET',
		headers: entries,
		...options
	});
	return res.json() as T;
}

export async function post<T>(
	url: string,
	data: Record<string, any>,
	{ headers, ...options }: Partial<RequestInit> = {}
) {
	let entries: [string, string][] = [];
	if (headers instanceof Headers)
		for (const item of headers.entries()) entries.push(item);
	else if (Array.isArray(headers)) entries = entries.concat(headers);
	else if (headers)
		for (const key of Object.keys(headers)) entries.push([key, headers[key]]);
	const res = await fetch(url, {
		method: 'POST',
		body: JSON.stringify(data),
		headers: entries,
		...options
	});
	return res.json() as T;
}
