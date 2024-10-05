import * as React from 'react';
import type { SVGProps } from 'react';
const SvgCable = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="1em"
		height="1em"
		viewBox="0 0 24 24"
		fill="currentColor"
		{...props}
	>
		<path d="M20 5V4c0-.55-.45-1-1-1h-2c-.55 0-1 .45-1 1v1c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1h1v6.91c0 1.04-.76 1.98-1.79 2.08-1.2.12-2.21-.82-2.21-1.99V7.14c0-2.13-1.61-3.99-3.74-4.13A3.993 3.993 0 0 0 5 7v7H4c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1v1c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-1c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1H7V7.09c0-1.04.76-1.98 1.79-2.08C9.99 4.89 11 5.83 11 7v9.86c0 2.13 1.61 3.99 3.74 4.13C17.07 21.14 19 19.3 19 17v-7h1c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1" />
	</svg>
);
export default SvgCable;
