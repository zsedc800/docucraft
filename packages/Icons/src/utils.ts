export function classnames(
	...args: (string | Record<string, boolean | undefined> | undefined)[]
) {
	return args
		.filter(Boolean)
		.map((item) => {
			if (typeof item === 'string') return item;
			return Object.keys(item!)
				.filter((key) => !!item![key])
				.join(' ');
		})
		.join(' ');
}
