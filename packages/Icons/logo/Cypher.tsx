import * as React from 'react';
import type { SVGProps } from 'react';
const SvgCypher = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		xmlSpace="preserve"
		width="1em"
		height="1em"
		viewBox="0 0 48 48"
		fill="currentColor"
		{...props}
	>
		<path d="M26.142 38.143v-5.659L17.657 24l8.485-8.484V9.857L12 24zM33.858 9.857v5.659L42.343 24l-8.485 8.484v5.659L48 24zM9.021 0 0 48h4.07l9.022-48z" />
	</svg>
);
export default SvgCypher;
