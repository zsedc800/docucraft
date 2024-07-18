import { NoLanes } from '../Lanes';
import { Fiber, FiberFlags, FiberTag, Key, Mode, Props } from '../interface';

export function createFiberNode(
	tag: FiberTag,
	pendingProps: Props,
	options?: Partial<Fiber>
): Fiber {
	const { key, ref } = pendingProps;
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
		pendingLanes: NoLanes,
		renderLanes: NoLanes,
		expiredLanes: NoLanes,
		alternate: null,
		effects: null
	};
	return Object.assign(base, {}, options);
}

export function createFiberByElement() {}
export function cloneFiberNode(
	oldFiber: Fiber,
	pendingProps: Props,
	options: Partial<Fiber> = {}
) {
	const { key, ref } = pendingProps;
	const { parent, child, sibling } = options;
	if (!child) options.child = null;
	if (!sibling) options.sibling = null;
	if (parent) {
		// options.lanes =
	}
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
