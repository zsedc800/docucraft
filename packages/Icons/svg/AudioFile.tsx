import * as React from 'react';
import type { SVGProps } from 'react';
const SvgAudioFile = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="1em"
		height="1em"
		viewBox="0 0 24 24"
		{...props}
	>
		<path d="m19.41 7.41-4.83-4.83c-.37-.37-.88-.58-1.41-.58H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8.83c0-.53-.21-1.04-.59-1.42M15 13h-2v3.61c0 1.28-1 2.41-2.28 2.39a2.26 2.26 0 0 1-2.13-2.91c.21-.72.8-1.31 1.53-1.51.7-.19 1.36-.05 1.88.29V12c0-.55.45-1 1-1h2c.55 0 1 .45 1 1s-.45 1-1 1m-1-4c-.55 0-1-.45-1-1V3.5L18.5 9z" />
	</svg>
);
export default SvgAudioFile;
