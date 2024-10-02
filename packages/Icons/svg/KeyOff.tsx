import * as React from 'react';
import type { SVGProps } from 'react';
const SvgKeyOff = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="1em"
		height="1em"
		viewBox="0 0 24 24"
		{...props}
	>
		<path d="m12.83 10 4.09 4.09L17 14l1.29 1.29c.39.39 1.03.39 1.42 0l2.59-2.61a1 1 0 0 0-.01-1.42l-.99-.97c-.2-.19-.45-.29-.71-.29zm6.24 11.9a.996.996 0 1 0 1.41-1.41L3.51 3.51A.996.996 0 1 0 2.1 4.92L3.98 6.8A6.04 6.04 0 0 0 1 12c0 3.31 2.69 6 6 6 2.21 0 4.15-1.2 5.18-2.99zm-9.16-9.16A3.015 3.015 0 0 1 7 15c-1.65 0-3-1.35-3-3 0-1.4.97-2.58 2.26-2.91z" />
	</svg>
);
export default SvgKeyOff;
