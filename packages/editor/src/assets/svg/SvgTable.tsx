import * as React from 'react';
import type { SVGProps } from 'react';
import { Ref, forwardRef } from 'react';
const SvgTable = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => {
	return (
		<svg
			fill="currentColor"
			ref={ref}
			{...props}
			viewBox="0 0 48 48"
			xmlns="http://www.w3.org/2000/svg"
		>
			<rect
				x="4.5"
				y="5.5"
				width="39"
				height="39"
				rx="1.5"
				stroke="#D9D9D9"
				stroke-linejoin="round"
			/>
			<line x1="5" y1="10.5" x2="43" y2="10.5" stroke="#D9D9D9" />
			<line x1="5" y1="15.5" x2="43" y2="15.5" stroke="#D9D9D9" />
			<path d="M5 21H43" stroke="#D9D9D9" />
			<line x1="5" y1="26.5" x2="43" y2="26.5" stroke="#D9D9D9" />
			<line x1="5" y1="32.5" x2="43" y2="32.5" stroke="#D9D9D9" />
			<line x1="5" y1="38.5" x2="43" y2="38.5" stroke="#D9D9D9" />
			<line x1="15.5" y1="6" x2="15.5" y2="44" stroke="#D9D9D9" />
			<line x1="22.5" y1="6" x2="22.5" y2="44" stroke="#D9D9D9" />
			<line x1="29.5" y1="6" x2="29.5" y2="44" stroke="#D9D9D9" />
			<line x1="36.5" y1="6" x2="36.5" y2="44" stroke="#D9D9D9" />
		</svg>
	);
};

const ForwardRef = forwardRef(SvgTable);
export default ForwardRef;
