import * as React from 'react';
import type { SVGProps } from 'react';
const SvgJoinFull = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="1em"
		height="1em"
		viewBox="0 0 24 24"
		fill="currentColor"
		{...props}
	>
		<path d="M12.68 6.8c-.39-.35-.98-.35-1.37 0C9.35 8.56 9 10.84 9 12c0 1.15.35 3.44 2.32 5.2.39.35.98.35 1.37 0C14.65 15.44 15 13.16 15 12c0-1.15-.35-3.44-2.32-5.2" />
		<path d="M7.5 12c0-.97.23-4.16 3.03-6.5C9.75 5.19 8.9 5 8 5c-3.86 0-7 3.14-7 7s3.14 7 7 7c.9 0 1.75-.19 2.53-.5-2.8-2.34-3.03-5.53-3.03-6.5M16 5c-.9 0-1.75.19-2.53.5 2.8 2.34 3.03 5.53 3.03 6.5s-.23 4.16-3.03 6.5c.78.31 1.63.5 2.53.5 3.86 0 7-3.14 7-7s-3.14-7-7-7" />
	</svg>
);
export default SvgJoinFull;
