import * as React from 'react';
import type { SVGProps } from 'react';
const SvgHdrOff = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="1em"
		height="1em"
		viewBox="0 0 24 24"
		fill="currentColor"
		{...props}
	>
		<path d="M17.5 14.25V13h1.1l.72 1.59a.693.693 0 0 0 1.27-.55l-.49-1.14c.5-.3.9-.8.9-1.4v-1c0-.83-.67-1.5-1.5-1.5H17c-.55 0-1 .45-1 1v3.9l1.04 1.04c.27-.11.46-.38.46-.69m0-3.75h2v1h-2zm-4.5 0v.4l1.5 1.5v-1.9c0-.82-.68-1.5-1.5-1.5h-1.9l1.5 1.5zm8.03 10.53-18-18a.742.742 0 1 0-1.05 1.05l4.98 4.98c-.27.11-.46.38-.46.69V11h-2V9.75c0-.41-.34-.75-.75-.75S3 9.34 3 9.75v4.5c0 .41.34.75.75.75s.75-.34.75-.75V12.5h2v1.75c0 .41.34.75.75.75s.75-.34.75-.75V10.1l1.5 1.5v2.9c0 .28.22.5.5.5h2.5c.12 0 .24-.01.36-.04l7.11 7.11c.29.29.76.29 1.05 0a.74.74 0 0 0 .01-1.04" />
	</svg>
);
export default SvgHdrOff;
