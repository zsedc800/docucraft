import { Suspense, lazy, useState, useTransition } from '@docucraft/srender';
import { Button } from '@docucraft/ui';

const cache: any = {};
const useMemo = (fn: (e: any) => any, [dep]: any[]) => {
	if (!cache[dep]) cache[dep] = fn(dep);
	return cache[dep];
};
const createPromise = (val: any, ts = 3000) =>
	new Promise((r) => setTimeout(() => r(val), ts));

const Main = () => {
	const [p, setState] = useState(0);
	const [isPending, startTransition] = useTransition();

	const Cnp = useMemo(
		(index) => {
			const p = createPromise('hello' + index);
			return lazy(() =>
				p.then((r: any) => ({ default: () => <span>{r}</span> }))
			);
		},
		[p]
	);

	return (
		<>
			<div>
				<Button
					onClick={() => {
						console.log('click');
						startTransition(() => {
							setState(p + 1);
						});
					}}
				>
					{isPending ? '加载中...' : '加载'}
				</Button>
			</div>
			<Cnp />
		</>
	);
};

const now = performance.now;
const ListItem = ({ children }: any) => {
	const current = performance.now();

	while (performance.now() - current < 5);
	return <li>{children}</li>;
};

const Input = () => {
	const [val, setVal] = useState('');
	console.log(val, 'val');

	return (
		<div>
			<input
				placeholder="输入"
				value={val}
				onInput={(e) => setVal((e.target as HTMLInputElement).value)}
			/>

			<span>{val}</span>
		</div>
	);
};

const List = () => {
	const [flag, toggle] = useState(false);
	const [isPending, startTransition] = useTransition();
	console.log(isPending, 'pending');

	return (
		<>
			<Button
				onClick={() => {
					startTransition(() => {
						toggle(!flag);
					});
				}}
			>
				toggle
			</Button>

			<div style={{ height: '300px', overflow: 'auto' }}>
				{isPending ? (
					'加载中'
				) : flag ? (
					<div id="ttyu">
						{Array.from({ length: 1000 }).map((t, i) => (
							<ListItem>{i}</ListItem>
						))}
					</div>
				) : (
					'empty'
				)}
			</div>
		</>
	);
};

export default () => {
	return (
		<>
			<Input />
			<List />
		</>
	);
};

// export default () => (
// 	<Suspense fallback={<div>加载中...</div>}>
// 		<Main />
// 	</Suspense>
// );
