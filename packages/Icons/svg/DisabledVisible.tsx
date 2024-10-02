import * as React from 'react';
import type { SVGProps } from 'react';
const SvgDisabledVisible = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="1em"
		height="1em"
		viewBox="0 0 24 24"
		{...props}
	>
		<path d="M21.99 12.34c.01-.11.01-.23.01-.34 0-5.52-4.48-10-10-10S2 6.48 2 12c0 5.17 3.93 9.43 8.96 9.95a9.3 9.3 0 0 1-2.32-2.68A8.01 8.01 0 0 1 4 12c0-1.85.63-3.55 1.69-4.9l5.66 5.66c.56-.4 1.17-.73 1.82-1L7.1 5.69A7.9 7.9 0 0 1 12 4c4.24 0 7.7 3.29 7.98 7.45.71.22 1.39.52 2.01.89M17 13c-3.18 0-5.9 1.87-7 4.5 1.1 2.63 3.82 4.5 7 4.5s5.9-1.87 7-4.5c-1.1-2.63-3.82-4.5-7-4.5m0 7a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5m1.5-2.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5" />
	</svg>
);
export default SvgDisabledVisible;