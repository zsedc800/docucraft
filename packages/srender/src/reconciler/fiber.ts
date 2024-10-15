import { NoLanes } from '../Lanes';
import { Fiber, FiberFlags, FiberTag, Mode, Props } from '../interface';

export function createFiberNode(
	tag: FiberTag,
	props: Props,
	options?: Partial<Fiber>
): Fiber {
	const { key, ref, ...pendingProps } = props;
	const parent = options?.parent;
	const base = {
		tag,
		key,
		mode: parent ? parent.mode : Mode.NoMode,
		pendingProps,
		type: null,
		stateNode: null,
		parent: null,
		child: null,
		sibling: null,
		index: 0,
		ref,
		memoizedProps: null,
		memoizedState: null,
		updateQueue: null,
		flags: FiberFlags.Placement,
		lanes: NoLanes,
		childLanes: NoLanes,
		alternate: null,
		effects: null
	};
	return Object.assign(base, {}, options);
}

export function createFiberByElement() {}
export function cloneFiberNode(
	oldFiber: Fiber,
	props: Props,
	options: Partial<Fiber> = {}
) {
	const { key, ref, ...pendingProps } = props;
	const { child, sibling } = options;
	if (!child) options.child = null;
	if (!sibling) options.sibling = null;

	const fiber = Object.assign(
		{ key, ref },
		oldFiber,
		options,
		pendingProps
			? {
					pendingProps
				}
			: {}
	);
	fiber.effects = [];
	fiber.flags = FiberFlags.Update;
	return fiber;
}
