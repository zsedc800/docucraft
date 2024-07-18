import { Lane, Lanes, SyncLane } from './consts';

export * from './consts';

export function isSubsetOfLanes(set: Lanes, subset: Lanes | Lane) {
	return (set & subset) === subset;
}

export function mergeLanes(a: Lanes | Lane, b: Lanes | Lane) {
	return a | b;
}

export function removeLanes(set: Lanes, subset: Lanes | Lane) {
	return set & ~subset;
}

export function intersectLanes(a: Lanes | Lane, b: Lanes | Lane) {
	return a & b;
}

export function getHighestPriorityLane(lanes: Lanes) {
	return lanes & -lanes;
}

export function requestUpdateLane(): Lane {
	return SyncLane;
}
