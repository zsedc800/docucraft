import * as React from 'react';
import type { SVGProps } from 'react';
const SvgLeakAdd = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="1em"
		height="1em"
		viewBox="0 0 24 24"
		{...props}
	>
		<path d="M11.05 21c.5 0 .94-.37.99-.87a9 9 0 0 1 8.08-8.08c.5-.05.88-.48.88-.99 0-.59-.51-1.06-1.1-1-5.19.52-9.32 4.65-9.84 9.83-.06.59.4 1.11.99 1.11M18 21h3v-3c-1.66 0-3 1.34-3 3m-2.91 0c.49 0 .9-.36.98-.85.36-2.08 2-3.72 4.08-4.08.49-.08.85-.49.85-.98 0-.61-.54-1.09-1.14-1a6.99 6.99 0 0 0-5.77 5.77c-.1.6.39 1.14 1 1.14M12.97 3.02c-.5 0-.94.37-.99.87a9 9 0 0 1-8.08 8.08c-.5.05-.88.48-.88.99 0 .59.51 1.06 1.1 1 5.19-.52 9.32-4.65 9.84-9.83a1 1 0 0 0-.99-1.11m-6.94 0h-3v3c1.66 0 3-1.34 3-3m2.91 0c-.49 0-.9.36-.98.85-.36 2.08-2 3.72-4.08 4.08-.49.09-.85.49-.85.99 0 .61.54 1.09 1.14 1a6.99 6.99 0 0 0 5.77-5.77c.09-.61-.4-1.15-1-1.15" />
	</svg>
);
export default SvgLeakAdd;
