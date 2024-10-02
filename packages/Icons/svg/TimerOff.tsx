import * as React from 'react';
import type { SVGProps } from 'react';
const SvgTimerOff = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="1em"
		height="1em"
		viewBox="0 0 24 24"
		{...props}
	>
		<path d="M10 3h4c.55 0 1-.45 1-1s-.45-1-1-1h-4c-.55 0-1 .45-1 1s.45 1 1 1m2 5c.55 0 1 .45 1 1v1.17l6.98 6.98a8.96 8.96 0 0 0-.95-9.76l.75-.75a.993.993 0 0 0 0-1.4l-.01-.01a.993.993 0 0 0-1.4 0l-.75.75A8.96 8.96 0 0 0 12 4c-1.48 0-2.89.38-4.13 1.04l3.36 3.36c.18-.24.45-.4.77-.4M2.1 3.51a.996.996 0 0 0 0 1.41l2.72 2.72C3.73 9.09 3.05 10.86 3 12.76a8.998 8.998 0 0 0 14.38 7.45l1.69 1.69a.996.996 0 1 0 1.41-1.41L3.51 3.51a.996.996 0 0 0-1.41 0" />
	</svg>
);
export default SvgTimerOff;
