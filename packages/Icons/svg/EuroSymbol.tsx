import * as React from 'react';
import type { SVGProps } from 'react';
const SvgEuroSymbol = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="1em"
		height="1em"
		viewBox="0 0 24 24"
		{...props}
	>
		<path d="M15 18.5A6.48 6.48 0 0 1 9.24 15H14c.55 0 1-.45 1-1s-.45-1-1-1H8.58c-.05-.33-.08-.66-.08-1s.03-.67.08-1H14c.55 0 1-.45 1-1s-.45-1-1-1H9.24A6.49 6.49 0 0 1 15 5.5c1.25 0 2.42.36 3.42.97.5.31 1.15.26 1.57-.16.58-.58.45-1.53-.25-1.96A9.03 9.03 0 0 0 15 3c-3.92 0-7.24 2.51-8.48 6H4c-.55 0-1 .45-1 1s.45 1 1 1h2.06a8.3 8.3 0 0 0 0 2H4c-.55 0-1 .45-1 1s.45 1 1 1h2.52c1.24 3.49 4.56 6 8.48 6 1.74 0 3.36-.49 4.74-1.35.69-.43.82-1.39.24-1.97-.42-.42-1.07-.47-1.57-.15-.99.62-2.15.97-3.41.97" />
	</svg>
);
export default SvgEuroSymbol;
