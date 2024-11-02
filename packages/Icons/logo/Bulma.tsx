import * as React from 'react';
import type { SVGProps } from 'react';
import { Ref, forwardRef } from 'react';
const SvgBulma = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 128 128"
		width="1em"
		height="1em"
		ref={ref}
		{...props}
	>
		<path
			fill="#00D1B2"
			d="m59.2 0 40 40-24 24 32 31.9L59.4 128l-40-39.9 7.7-56z"
		/>
	</svg>
);
const ForwardRef = forwardRef(SvgBulma);
export default ForwardRef;
