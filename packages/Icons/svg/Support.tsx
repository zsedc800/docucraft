import * as React from 'react';
import type { SVGProps } from 'react';
const SvgSupport = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="1em"
		height="1em"
		viewBox="0 0 24 24"
		{...props}
	>
		<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m7.46 7.12-2.78 1.15a4.98 4.98 0 0 0-2.95-2.94l1.15-2.78c2.1.8 3.77 2.47 4.58 4.57M12 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3M9.13 4.54l1.17 2.78a5 5 0 0 0-2.98 2.97L4.54 9.13a7.98 7.98 0 0 1 4.59-4.59M4.54 14.87l2.78-1.15a4.97 4.97 0 0 0 2.97 2.96l-1.17 2.78a8 8 0 0 1-4.58-4.59m10.34 4.59-1.15-2.78a4.98 4.98 0 0 0 2.95-2.97l2.78 1.17a8 8 0 0 1-4.58 4.58" />
	</svg>
);
export default SvgSupport;
