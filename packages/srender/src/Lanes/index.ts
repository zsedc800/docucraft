import { currentBatchConfig } from '../reconciler/core';
import { isBatchingUpdates } from '../reconciler/update';
import {
	IdlePriority,
	ImmediatePriority,
	NoPriority,
	NormalPriority,
	UserBlockingPriority
} from '../scheduler';
import {
	ContinuousEventPriority,
	DiscreteEventPriority,
	Lane,
	Lanes,
	NoLane,
	NonIdleLanes,
	SyncLane,
	TransitionLane1
} from './consts';

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

let currentIndex = 0;
let batchTransitionLane = NoLane;
export function resetBatchTransitionLane() {
	batchTransitionLane = NoLane;
}
function getTransitionLane() {
	const res = TransitionLane1 << currentIndex;
	currentIndex = (currentIndex + 1) % 16;
	return res;
}
export function requestUpdateLane(): Lane {
	if (currentBatchConfig.transition) {
		batchTransitionLane =
			batchTransitionLane === NoLane || !isBatchingUpdates
				? getTransitionLane()
				: batchTransitionLane;
		return batchTransitionLane;
	}
	return SyncLane;
}

export function LaneToPriority(lane: Lane) {
	if (lane <= DiscreteEventPriority) return ImmediatePriority;
	if (lane <= ContinuousEventPriority) return UserBlockingPriority;
	if (lane & NonIdleLanes) return NormalPriority;
	return IdlePriority;
}
