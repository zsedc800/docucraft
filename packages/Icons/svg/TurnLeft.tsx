import * as React from 'react';
import type { SVGProps } from 'react';
const SvgTurnLeft = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="1em"
		height="1em"
		viewBox="0 0 24 24"
		{...props}
	>
		<path d="M7.71 13.29a.996.996 0 0 1-1.41 0L3.71 10.7a.996.996 0 0 1 0-1.41L6.3 6.7a.996.996 0 1 1 1.41 1.41L6.83 9H15c1.1 0 2 .9 2 2v8c0 .55-.45 1-1 1s-1-.45-1-1v-8H6.83l.88.88c.39.39.39 1.02 0 1.41" />
	</svg>
);
export default SvgTurnLeft;
