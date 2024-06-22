import {
	ClassComponent,
	ComponentChildren,
	IFiber,
	IProps,
	IState,
	ITag
} from './interface';
import { batchUpdate } from './reconciler';

export class Component<P = IProps> {
	public props: P;
	public state?: IState;

	public __fiber?: IFiber;

	constructor(props: P | null) {
		this.props = props || ({} as P);
	}

	componentDidMount(props: P) {}

	destory() {}

	setState(state: any) {
		this.__fiber!.partialState = state;
		batchUpdate({ from: ITag.CLASS_COMPONENT, fiber: this.__fiber });
	}
	render(): ComponentChildren {
		throw new Error('render method should be implemented');
	}
}

export function createInstance(fiber: IFiber) {
	const instance = new (fiber.type as ClassComponent)(fiber.props);
	instance.__fiber = fiber;
	return instance;
}
