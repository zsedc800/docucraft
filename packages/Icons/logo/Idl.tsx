import * as React from 'react';
import type { SVGProps } from 'react';
import { Ref, forwardRef } from 'react';
const SvgIdl = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="1em"
		height="1em"
		viewBox="0 0 16 16"
		ref={ref}
		{...props}
	>
		<g fill="none" fillRule="evenodd">
			<path fill="#B99BF8" fillOpacity={0.7} d="M1 16h15V9H1z" />
			<path fill="#9AA7B0" fillOpacity={0.8} d="M7 1 3 5h4z" />
			<path fill="#9AA7B0" fillOpacity={0.8} d="M8 1v5H3v2h10V1z" />
			<path
				fill="#231F20"
				fillOpacity={0.7}
				d="M3 15h1v-5H3zM6 11v3h.649C7.578 14 8 13.493 8 12.515V12.5c0-.978-.422-1.5-1.351-1.5zm-1-1h1.649C8.04 10 9 11.093 9 12.5c0 1.421-.96 2.5-2.351 2.5H5zM10 10h1v4h2.5v1H10z"
			/>
		</g>
	</svg>
);
const ForwardRef = forwardRef(SvgIdl);
export default ForwardRef;
