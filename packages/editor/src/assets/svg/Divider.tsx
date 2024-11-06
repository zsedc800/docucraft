import * as React from 'react';
import type { SVGProps } from 'react';
import { Ref, forwardRef } from 'react';
const SvgDivider = (
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
			<line x1="5" y1="4.5" x2="38" y2="4.5" stroke="#999999" />
			<path d="M5 10H41" stroke="#999999" />
			<path d="M5 15H33" stroke="#999999" />
			<line x1="5" y1="23.5" x2="45" y2="23.5" stroke="black" />
			<line x1="5" y1="32.5" x2="42" y2="32.5" stroke="#999999" />
			<line x1="5" y1="37.5" x2="38" y2="37.5" stroke="#999999" />
			<line x1="5" y1="42.5" x2="32" y2="42.5" stroke="#999999" />
		</svg>
	);
};

const ForwardRef = forwardRef(SvgDivider);
export default ForwardRef;
