import * as React from 'react';
import type { SVGProps } from 'react';
import { Ref, forwardRef } from 'react';
const SvgExposureNeg1 = (
	props: SVGProps<SVGSVGElement>,
	ref: Ref<SVGSVGElement>
) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="1em"
		height="1em"
		viewBox="0 0 24 24"
		fill="currentColor"
		ref={ref}
		{...props}
	>
		<path d="M4 12c0 .55.45 1 1 1h6c.55 0 1-.45 1-1s-.45-1-1-1H5c-.55 0-1 .45-1 1m15 6h-2V7.38L14 8.4V6.7L18.7 5h.3z" />
	</svg>
);
const ForwardRef = forwardRef(SvgExposureNeg1);
export default ForwardRef;
