import * as React from 'react';
import type { SVGProps } from 'react';
import { Ref, forwardRef } from 'react';
const SvgHorizontalRule = (
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
		<path
			fillRule="evenodd"
			d="M19 13H5c-.55 0-1-.45-1-1s.45-1 1-1h14c.55 0 1 .45 1 1s-.45 1-1 1"
		/>
	</svg>
);
const ForwardRef = forwardRef(SvgHorizontalRule);
export default ForwardRef;
