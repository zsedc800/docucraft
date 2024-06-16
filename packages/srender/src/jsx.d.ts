declare namespace JSX {
	interface IntrinsicElements {
		[elemName: string]: any;
	}

	interface Element {
		type: string | Function;
		props: {
			[key: string]: any;
			children?: Element[];
		};
	}

	interface ElementClass {
		render: any;
	}

	interface ElementAttributesProperty {
		props: any;
	}

	interface ElementChildrenAttribute {
		children: {};
	}
}

declare const createElement: (
	type: string | Function,
	props: any,
	...children: any[]
) => JSX.Element;
declare const Fragment: (props: any) => JSX.Element;
