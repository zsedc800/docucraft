import * as React from 'react';
import type { SVGProps } from 'react';
const SvgSelfImprovement = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="1em"
		height="1em"
		viewBox="0 0 24 24"
		fill="currentColor"
		{...props}
	>
		<circle cx={12} cy={6} r={2} />
		<path d="M21 14.94c0-.5-.36-.93-.85-.98-1.88-.21-3.49-1.13-4.75-2.63l-1.34-1.6c-.38-.47-.94-.73-1.53-.73h-1.05c-.59 0-1.15.26-1.53.72l-1.34 1.6c-1.25 1.5-2.87 2.42-4.75 2.63-.5.06-.86.49-.86.99 0 .6.53 1.07 1.13 1 2.3-.27 4.32-1.39 5.87-3.19V15l-3.76 1.5c-.65.26-1.16.83-1.23 1.53A1.79 1.79 0 0 0 6.79 20H9v-.5a2.5 2.5 0 0 1 2.5-2.5h3c.28 0 .5.22.5.5s-.22.5-.5.5h-3c-.83 0-1.5.67-1.5 1.5v.5h7.1c.85 0 1.65-.54 1.85-1.37.21-.89-.27-1.76-1.08-2.08L14 15v-2.25c1.56 1.8 3.57 2.91 5.87 3.19.6.06 1.13-.4 1.13-1" />
	</svg>
);
export default SvgSelfImprovement;
