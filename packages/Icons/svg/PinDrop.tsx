import * as React from 'react';
import type { SVGProps } from 'react';
import { Ref, forwardRef } from 'react';
const SvgPinDrop = (
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
		<path d="M6 20h12c.55 0 1 .45 1 1s-.45 1-1 1H6c-.55 0-1-.45-1-1s.45-1 1-1m6-13c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0-5c3.27 0 7 2.46 7 7.15 0 2.98-2.13 6.12-6.39 9.39-.36.28-.86.28-1.22 0Q5 13.62 5 9.15C5 4.46 8.73 2 12 2" />
	</svg>
);
const ForwardRef = forwardRef(SvgPinDrop);
export default ForwardRef;
