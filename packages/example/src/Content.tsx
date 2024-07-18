import { Suspense, lazy, useMemo, useState } from '@docucraft/srender';
import { Button } from '@docucraft/ui';
const Cmp = lazy(
	() =>
		new Promise<any>((r) =>
			setTimeout(() => r({ default: () => (<div>lucky...</div>) as any }), 5000)
		)
);
const createPromise = (val: any, ts = 3000) =>
	new Promise((r) => setTimeout(() => r(val), ts));
export default () => {
	const [p, setState] = useState(createPromise(23445));

	const Cnp = useMemo(
		() => lazy(() => p.then((r: any) => ({ default: () => <span>{r}</span> }))),
		[p]
	);

	return (
		<>
			<div>
				<Button
					onClick={() => {
						console.log('click');
						setState(createPromise('helol'));
					}}
				>
					加载
				</Button>
			</div>
			<Suspense fallback={<div>加载中...</div>}>
				{/* <Cmp /> */}
				{/* <div className="">{read()}</div> */}
				<Cnp />
			</Suspense>
		</>
	);
};
