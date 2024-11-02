import * as React from 'react';
import type { SVGProps } from 'react';
import { Ref, forwardRef } from 'react';
const SvgCrop = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="1em"
		height="1em"
		viewBox="0 0 24 24"
		fill="currentColor"
		ref={ref}
		{...props}
	>
		<path d="M17 15h2V7c0-1.1-.9-2-2-2H9v2h7c.55 0 1 .45 1 1zm-9 2c-.55 0-1-.45-1-1V2c0-.55-.45-1-1-1s-1 .45-1 1v3H2c-.55 0-1 .45-1 1s.45 1 1 1h3v10c0 1.1.9 2 2 2h10v3c0 .55.45 1 1 1s1-.45 1-1v-3h3c.55 0 1-.45 1-1s-.45-1-1-1z" />
	</svg>
);
const ForwardRef = forwardRef(SvgCrop);
export default ForwardRef;
