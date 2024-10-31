import * as React from 'react';
import type { SVGProps } from 'react';
const SvgForth = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		xmlSpace="preserve"
		width="1em"
		height="1em"
		viewBox="0 0 15.594 15.594"
		fill="currentColor"
		{...props}
	>
		<path
			d="M14.252 0H1.341C.602 0 0 .602 0 1.341v12.911c0 .74.602 1.342 1.341 1.342h12.912c.739 0 1.341-.602 1.341-1.342V1.341A1.345 1.345 0 0 0 14.252 0m.192 14.252a.19.19 0 0 1-.191.193H1.341a.19.19 0 0 1-.192-.193V1.341c0-.105.086-.191.192-.191h12.912c.105 0 .191.086.191.191z"
			style={{
				fill: '#030104'
			}}
		/>
		<path
			d="M10.147 3.063h-2.71L3.853 8.832v1.441h4.195v2.258h2.099v-2.258h1.136v-1.66h-1.136zM8.048 6.515v2.098H5.922v-.029l1.267-2.069c.32-.597.568-1.15.875-1.763h.058a24 24 0 0 0-.074 1.763"
			style={{
				fill: '#030104'
			}}
		/>
	</svg>
);
export default SvgForth;
