import { mergeLanes } from '../Lanes';
import { Fiber, FiberTag, RootFiberNode } from '../interface';

let workInProgressRoot: RootFiberNode | null = null;

export function setWorkInProgressRoot(root: RootFiberNode | null) {
	workInProgressRoot = root;
}

export function getWorkInProgressRoot() {
	return workInProgressRoot;
}

export function markUpdateFromFiberToRoot(fiber: Fiber) {
	let parent = fiber.parent,
		node = fiber;
	while (parent) {
		parent.childLanes |= mergeLanes(node.lanes, node.childLanes);
		node = parent;
		parent = parent.parent;
	}

	if (node.tag !== FiberTag.HostRoot) {
		return null;
	}
	const root = node.stateNode as RootFiberNode;

	root.pendingLanes = mergeLanes(node.lanes, node.childLanes);
	return root;
}

let isBatchingUpdates = false;
export const setBatchingUpdates = (e: boolean) => (isBatchingUpdates = e);
export const getIsBatchingUpdates = () => isBatchingUpdates;
