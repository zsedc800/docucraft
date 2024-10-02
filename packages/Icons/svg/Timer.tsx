import * as React from 'react';
import type { SVGProps } from 'react';
const SvgTimer = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="1em"
		height="1em"
		viewBox="0 0 24 24"
		{...props}
	>
		<path d="M10 3h4c.55 0 1-.45 1-1s-.45-1-1-1h-4c-.55 0-1 .45-1 1s.45 1 1 1m9.03 4.39.75-.75a.993.993 0 0 0 0-1.4l-.01-.01a.993.993 0 0 0-1.4 0l-.75.75A8.96 8.96 0 0 0 12 4c-4.8 0-8.88 3.96-9 8.76A9 9 0 0 0 12 22a8.994 8.994 0 0 0 7.03-14.61M13 13c0 .55-.45 1-1 1s-1-.45-1-1V9c0-.55.45-1 1-1s1 .45 1 1z" />
	</svg>
);
export default SvgTimer;
