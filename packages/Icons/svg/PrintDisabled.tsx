import * as React from 'react';
import type { SVGProps } from 'react';
const SvgPrintDisabled = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="1em"
		height="1em"
		viewBox="0 0 24 24"
		{...props}
	>
		<path d="M2.12 2.32A.996.996 0 1 0 .71 3.73L4.98 8A3 3 0 0 0 2 11v4c0 1.1.9 2 2 2h2v2c0 1.1.9 2 2 2h8c.55 0 1.04-.22 1.4-.58l2.83 2.83a.996.996 0 1 0 1.41-1.41zM15 19H9c-.55 0-1-.45-1-1v-4h2.98l4.72 4.72c-.19.17-.43.28-.7.28m4-11h-8.37l9 9H20c1.1 0 2-.9 2-2v-4c0-1.66-1.34-3-3-3m0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1m-2-5c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1H7c-.37 0-.68.21-.85.51L9.63 7z" />
	</svg>
);
export default SvgPrintDisabled;
