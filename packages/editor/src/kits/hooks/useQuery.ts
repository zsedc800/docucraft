import { useEffect, useRef, useState } from '@docucraft/srender';
import { QueryParams } from '../fetch/base';

export default <
	T extends Partial<QueryParams>,
	R = ReturnType<(e: T) => Promise<any>> extends Promise<infer U> ? U : never
>(
	fn: (e: T) => Promise<R>,
	initalParams: T = {} as T
) => {
	const params = useRef<T>(initalParams);
	const [result, setResult] = useState<R | undefined>(undefined);
	const [loading, setLoading] = useState(false);

	const execQuery = async () => {
		setLoading(true);
		fn(params.current!)
			.then((res) => {
				setResult(res);
			})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		execQuery();
	}, [params]);

	return [result, { params, loading, execQuery }] as const;
};
