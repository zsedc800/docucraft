import * as React from 'react';
import type { SVGProps } from 'react';
import { Ref, forwardRef } from 'react';
const SvgFsharp = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		baseProfile="tiny"
		overflow="visible"
		viewBox="0 0 128 128"
		width="1em"
		height="1em"
		ref={ref}
		{...props}
	>
		<path fill="#378BBA" d="M0 64.5 60.7 3.8v30.4L30.4 64.5l30.4 30.4v30.4z" />
		<path fill="#378BBA" d="m39.1 64.5 21.7-21.7v43.4z" />
		<path
			fill="#30B9DB"
			d="M128 64.5 65.1 3.8v30.4l30.4 30.4-30.4 30.3v30.4z"
		/>
	</svg>
);
const ForwardRef = forwardRef(SvgFsharp);
export default ForwardRef;
