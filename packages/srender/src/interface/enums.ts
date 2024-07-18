export enum FiberTag {
	HostComponent = 'Host',
	HostText = 'HostText',
	ClassComponent = 'Class',
	FunctionComponent = 'Function',
	HostRoot = 'Root',
	Fragment = 'Fragment',
	Suspense = 'Suspense',
	Offscreen = 'Offscreen',
	ContextProvider = 'ContextProvider',
	Unknown = 'Unknown'
}

export enum FiberFlags {
	NONE = 0,
	ShouldCapture = 1,
	DidCapture = 2,
	PerformWork = 4,
	Placement = 8,
	Deletion = 16,
	Update = 32
}

export enum UpdateState {
	replaceState = 1,
	updateState,
	forceUpdate,
	captureState
}

export enum Mode {
	NoMode = 0,
	Concurrent
}
