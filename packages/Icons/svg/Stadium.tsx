import * as React from 'react';
import type { SVGProps } from 'react';
const SvgStadium = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="1em"
		height="1em"
		viewBox="0 0 24 24"
		{...props}
	>
		<path d="M6.11 5.45 3.72 6.64A.502.502 0 0 1 3 6.19V3.81c0-.37.39-.61.72-.45L6.1 4.55c.37.19.37.71.01.9M18 3.81v2.38c0 .37.39.61.72.45l2.38-1.19c.37-.18.37-.71 0-.89l-2.38-1.19a.494.494 0 0 0-.72.44m-7-1v2.38c0 .37.39.61.72.45l2.38-1.19c.37-.18.37-.71 0-.89l-2.38-1.19a.494.494 0 0 0-.72.44m-6 7.23c1.38.49 3.77.96 7 .96s5.62-.47 7-.96C19 9.86 16.22 9 12 9s-7 .86-7 1.04M14 17h-4c-.55 0-1 .45-1 1v3.88c-4.06-.39-7-1.54-7-2.88v-9c0-1.66 4.48-3 10-3s10 1.34 10 3v9c0 1.34-2.94 2.48-7 2.87V18c0-.55-.45-1-1-1" />
	</svg>
);
export default SvgStadium;
