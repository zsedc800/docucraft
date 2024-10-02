import * as React from 'react';
import type { SVGProps } from 'react';
const SvgInterests = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="1em"
		height="1em"
		viewBox="0 0 24 24"
		{...props}
	>
		<path d="M7.02 13c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4M13 14v6c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1M6.13 3.57l-3.3 5.94c-.37.67.11 1.49.87 1.49h6.6c.76 0 1.24-.82.87-1.49l-3.3-5.94a.997.997 0 0 0-1.74 0M19.25 2.5c-1.06 0-1.81.56-2.25 1.17-.44-.61-1.19-1.17-2.25-1.17C13.19 2.5 12 3.78 12 5.25c0 1.83 2.03 3.17 4.35 5.18a1 1 0 0 0 1.3 0C19.97 8.42 22 7.08 22 5.25c0-1.47-1.19-2.75-2.75-2.75" />
	</svg>
);
export default SvgInterests;
