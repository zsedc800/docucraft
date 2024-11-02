import * as React from 'react';
import type { SVGProps } from 'react';
import { Ref, forwardRef } from 'react';
const SvgToml = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="1em"
		height="1em"
		viewBox="0 0 32 32"
		ref={ref}
		{...props}
	>
		<path
			d="M22.76 6.83v3.25h-5v15.09h-3.5V10.08h-5V6.83Z"
			style={{
				fill: '#7f7f7f'
			}}
		/>
		<path
			d="M2 2h6.2v3.09H5.34v21.8H8.2V30H2ZM30 30h-6.2v-3.09h2.86V5.11H23.8V2H30Z"
			style={{
				fill: '#bfbfbf'
			}}
		/>
	</svg>
);
const ForwardRef = forwardRef(SvgToml);
export default ForwardRef;
