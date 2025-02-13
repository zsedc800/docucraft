declare module '@docucraft/icons/svg/*' {
	import * as React from 'react';

	interface SVGProps extends React.SVGProps<SVGSVGElement> {}

	const Component: React.FC<SVGProps>;
	export default Component;
}
