import * as React from 'react';
import type { SVGProps } from 'react';
import { Ref, forwardRef } from 'react';
const SvgSignalWifi4Bar = (
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
		<path d="M23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l10.08 12.56c.8 1 2.32 1 3.12 0z" />
	</svg>
);
const ForwardRef = forwardRef(SvgSignalWifi4Bar);
export default ForwardRef;
