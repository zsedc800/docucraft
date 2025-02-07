declare module '@docucraft/icons/svg' {
	import * as React from 'react';

	interface SVGProps extends React.SVGProps<SVGSVGElement> {}

	// const Component: React.FC<SVGProps>;

	const icons: Record<string, React.FC<SVGProps>>;
	export = icons;
}
