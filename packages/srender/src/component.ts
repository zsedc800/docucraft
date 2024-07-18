import {
	ClassComponent,
	ComponentChildren,
	Fiber,
	Props,
	State
} from './interface';

export class Component<P = Props, S = State, C = any> {
	public props: P;
	public state?: S;
	public context?: C;

	public __fiber?: Fiber;
	_snapshot: any;
	constructor(props: P | null, context?: C) {
		this.props = props || ({} as P);
		this.context = context;
	}
	shouldComponentUpdate(props: P, state: S, nextContext?: C): boolean {
		return true;
	}
	componentDidMount() {}
	componentDidUpdate(props: P, state: S, snapshot?: any) {}
	getSnapshotBeforeUpdate?(prevProps: P, prevState: S): any {}
	componentDidCatch?(error: any, errorInfo: any) {}
	componentWillUnmount() {}
	destory() {
		this.componentWillUnmount();
	}

	setState(state: any) {
		// this.__fiber!.partialState = state;
		// batchUpdate({ from: ITag.CLASS_COMPONENT, fiber: this.__fiber! });
	}
	render(): ComponentChildren {
		throw new Error('render method should be implemented');
	}
}

export function createInstance(fiber: Fiber) {
	const Ctor = fiber.type as ClassComponent;
	const instance = new Ctor(fiber.pendingProps, Ctor.contextType?.currentValue);
	instance.__fiber = fiber;
	return instance;
}
