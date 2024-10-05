import * as React from 'react';
import type { SVGProps } from 'react';
const SvgWifi1Bar = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="1em"
		height="1em"
		viewBox="0 0 24 24"
		fill="currentColor"
		{...props}
	>
		<circle cx={12} cy={18} r={2} />
	</svg>
);
export default SvgWifi1Bar;
