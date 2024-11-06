import * as React from 'react';
import type { SVGProps } from 'react';
import { Ref, forwardRef } from 'react';
const SvgEmphsis = (
	props: SVGProps<SVGSVGElement>,
	ref: Ref<SVGSVGElement>
) => {
	return (
		<svg
			fill="currentColor"
			ref={ref}
			{...props}
			viewBox="0 0 48 48"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="M5 4.5H41" stroke="#999999" />
			<path d="M5 10H41" stroke="#999999" />
			<path d="M5 15H41" stroke="#999999" />
			<line x1="5" y1="37.5" x2="41" y2="37.5" stroke="#999999" />
			<line x1="5" y1="42.5" x2="41" y2="42.5" stroke="#999999" />
			<path d="M5.5 22.5H44.5V31.5H5.5V22.5Z" stroke="black" />
		</svg>
	);
};

const ForwardRef = forwardRef(SvgEmphsis);
export default ForwardRef;
