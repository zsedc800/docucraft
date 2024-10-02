import * as React from 'react';
import type { SVGProps } from 'react';
const SvgGames = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="1em"
		height="1em"
		viewBox="0 0 24 24"
		{...props}
	>
		<path d="M15 7.29V3c0-.55-.45-1-1-1h-4c-.55 0-1 .45-1 1v4.29c0 .13.05.26.15.35l2.5 2.5c.2.2.51.2.71 0l2.5-2.5c.09-.09.14-.21.14-.35M7.29 9H3c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h4.29c.13 0 .26-.05.35-.15l2.5-2.5c.2-.2.2-.51 0-.71l-2.5-2.5A.48.48 0 0 0 7.29 9M9 16.71V21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-4.29a.47.47 0 0 0-.15-.35l-2.5-2.5c-.2-.2-.51-.2-.71 0l-2.5 2.5c-.09.09-.14.21-.14.35m7.35-7.56-2.5 2.5c-.2.2-.2.51 0 .71l2.5 2.5c.09.09.22.15.35.15H21c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1h-4.29a.45.45 0 0 0-.36.14" />
	</svg>
);
export default SvgGames;