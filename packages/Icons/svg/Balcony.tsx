import * as React from 'react';
import type { SVGProps } from 'react';
const SvgBalcony = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="1em"
		height="1em"
		viewBox="0 0 24 24"
		{...props}
	>
		<path d="M20 14.27V10c0-4.42-3.58-8-8-8s-8 3.58-8 8v4.27c-.6.34-1 .99-1 1.73v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-4c0-.74-.4-1.39-1-1.73M7 20H5v-4h2zm4 0H9v-4h2zm0-6H6v-4c0-2.97 2.16-5.44 5-5.92zm2-9.92A6 6 0 0 1 18 10v4h-5zM15 20h-2v-4h2zm4 0h-2v-4h2zM8 11c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1m8 0c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 1 .45 1 1" />
	</svg>
);
export default SvgBalcony;