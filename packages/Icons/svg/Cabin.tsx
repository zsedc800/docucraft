import * as React from 'react';
import type { SVGProps } from 'react';
const SvgCabin = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="1em"
		height="1em"
		viewBox="0 0 24 24"
		{...props}
	>
		<path d="M4.37 3.55C4.89 2.62 5.87 2 7 2c.38 0 .72-.22.89-.53.15-.31.5-.47.84-.47.74 0 1.26.8.9 1.45C9.11 3.38 8.13 4 7 4c-.38 0-.72.22-.89.53-.15.31-.5.47-.84.47-.74 0-1.26-.8-.9-1.45m18.02 8.64c-.34.44-.96.52-1.4.19l-.99-.76V20c0 .55-.45 1-1 1H5c-.55 0-1-.45-1-1v-8.38l-.99.76a.99.99 0 0 1-1.4-.19c-.33-.44-.25-1.07.19-1.4L4 9.11V7c0-.55.45-1 1-1s1 .45 1 1v.58l5.39-4.12c.36-.27.86-.27 1.21 0l9.6 7.33c.44.34.53.97.19 1.4M10.06 7h3.89L12 5.52zM6 10.1v.9h12v-.9L16.56 9H7.44zM6 13v2h12v-2zm12 6v-2H6v2z" />
	</svg>
);
export default SvgCabin;