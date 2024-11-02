import * as React from 'react';
import type { SVGProps } from 'react';
import { Ref, forwardRef } from 'react';
const SvgFiberManualRecord = (
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
		<circle cx={12} cy={12} r={8} />
	</svg>
);
const ForwardRef = forwardRef(SvgFiberManualRecord);
export default ForwardRef;
