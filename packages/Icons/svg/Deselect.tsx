import * as React from 'react';
import type { SVGProps } from 'react';
const SvgDeselect = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="1em"
		height="1em"
		viewBox="0 0 24 24"
		fill="currentColor"
		{...props}
	>
		<path d="M3 13h2v-2H3zm4 8h2v-2H7zm6-18h-2v2h2zm6 0v2h2c0-1.1-.9-2-2-2M5 21v-2H3c0 1.1.9 2 2 2m-2-4h2v-2H3zm8 4h2v-2h-2zm8-8h2v-2h-2zm0-4h2V7h-2zm-4-4h2V3h-2zM7.83 5 7 4.17V3h2v2zm12 12-.83-.83V15h2v2zM9 15v-3.17L12.17 15zM2.1 3.51a.996.996 0 0 0 0 1.41L4.17 7H3v2h2V7.83l2 2V16c0 .55.45 1 1 1h6.17l2 2H15v2h2v-1.17l2.07 2.07a.996.996 0 1 0 1.41-1.41L3.51 3.51a.996.996 0 0 0-1.41 0M17 8c0-.55-.45-1-1-1H9.83l2 2H15v3.17l2 2z" />
	</svg>
);
export default SvgDeselect;
