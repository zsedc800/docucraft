import {
	ClassComponent,
	ComponentChildren,
	Fiber,
	Props,
	State
} from './interface';
import {
	Updater,
	batchedUpdates,
	isBatchingUpdates
} from './reconciler/update';

export class Component<P = Props, S extends State = State, C = any> {
	public props: P;
	public state?: S;
	public context?: C;

	public __fiber?: Fiber;
	updater: Updater<S, P>;
	_snapshot: any;
	constructor(props: P | null, context?: C) {
		this.props = props || ({} as P);
		this.context = context;
		this.updater = new Updater<S, P>(this);
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

	setState(state: any, callback?: () => void) {
		// batchedUpdates(() => {

		if (this.__fiber) this.updater.setState(this.__fiber, state, callback);
		// });
	}
	render(): ComponentChildren {
		throw new Error('render method should be implemented');
	}
}

export function createInstance(fiber: Fiber) {
	const Ctor = fiber.type as ClassComponent;
	const instance = new Ctor(
		Object.assign({}, Ctor.defaultProps, fiber.pendingProps),
		Ctor.contextType?.currentValue
	);
	instance.__fiber = fiber;
	return instance;
}
