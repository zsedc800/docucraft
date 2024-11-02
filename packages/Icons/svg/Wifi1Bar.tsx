import * as React from 'react';
import type { SVGProps } from 'react';
import { Ref, forwardRef } from 'react';
const SvgWifi1Bar = (
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
		<circle cx={12} cy={18} r={2} />
	</svg>
);
const ForwardRef = forwardRef(SvgWifi1Bar);
export default ForwardRef;
