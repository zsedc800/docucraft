import * as React from 'react';
import type { SVGProps } from 'react';
const SvgStroller = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="1em"
		height="1em"
		viewBox="0 0 24 24"
		fill="currentColor"
		{...props}
	>
		<path d="M18 20c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2M6 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m8.3-13.9C13.03 3.4 11.56 3 10 3c-1.51 0-2.93.38-4.17 1.03-.59.31-.68 1.12-.22 1.58L9.6 9.6zm7.64 1.73C21.65 4.22 20.3 3 18.65 3c-1.66 0-2.54 1.27-3.18 2.03L6.71 15.31c-.55.65-.09 1.65.76 1.65H15c1.1 0 2-.9 2-2V6.27c.58-.68.97-1.27 1.65-1.27s1.22.52 1.33 1.21c.1.45.5.79.98.79.55 0 1-.45 1-1 0-.06-.01-.11-.02-.17" />
	</svg>
);
export default SvgStroller;
