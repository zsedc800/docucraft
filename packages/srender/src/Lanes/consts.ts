export type Lanes = number;
export type Lane = number;
// lane使用31位二进制来表示优先级车道共31条, 位数越小（1的位置越靠右）表示优先级越高
export const TotalLanes = 31;

// 没有优先级
export const NoLanes: Lanes = /*                        */ 0b0000000000000000000000000000000;
export const NoLane: Lane = /*                          */ 0b0000000000000000000000000000000;

// 同步优先级，表示同步的任务一次只能执行一个，例如：用户的交互事件产生的更新任务
export const SyncLane: Lane = /*                        */ 0b0000000000000000000000000000001;

// 连续触发优先级，例如：滚动事件，拖动事件等
export const InputContinuousHydrationLane: Lane = /*    */ 0b0000000000000000000000000000010;
export const InputContinuousLane: Lanes = /*            */ 0b0000000000000000000000000000100;

// 默认优先级，例如使用setTimeout，请求数据返回等造成的更新
export const DefaultHydrationLane: Lane = /*            */ 0b0000000000000000000000000001000;
export const DefaultLane: Lanes = /*                    */ 0b0000000000000000000000000010000;

// 过度优先级，例如: Suspense、useTransition、useDeferredValue等拥有的优先级
export const TransitionHydrationLane: Lane = /*                */ 0b0000000000000000000000000100000;
export const TransitionLanes: Lanes = /*                       */ 0b0000000001111111111111111000000;
export const TransitionLane1: Lane = /*                        */ 0b0000000000000000000000001000000;
export const TransitionLane2: Lane = /*                        */ 0b0000000000000000000000010000000;
export const TransitionLane3: Lane = /*                        */ 0b0000000000000000000000100000000;
export const TransitionLane4: Lane = /*                        */ 0b0000000000000000000001000000000;
export const TransitionLane5: Lane = /*                        */ 0b0000000000000000000010000000000;
export const TransitionLane6: Lane = /*                        */ 0b0000000000000000000100000000000;
export const TransitionLane7: Lane = /*                        */ 0b0000000000000000001000000000000;
export const TransitionLane8: Lane = /*                        */ 0b0000000000000000010000000000000;
export const TransitionLane9: Lane = /*                        */ 0b0000000000000000100000000000000;
export const TransitionLane10: Lane = /*                       */ 0b0000000000000001000000000000000;
export const TransitionLane11: Lane = /*                       */ 0b0000000000000010000000000000000;
export const TransitionLane12: Lane = /*                       */ 0b0000000000000100000000000000000;
export const TransitionLane13: Lane = /*                       */ 0b0000000000001000000000000000000;
export const TransitionLane14: Lane = /*                       */ 0b0000000000010000000000000000000;
export const TransitionLane15: Lane = /*                       */ 0b0000000000100000000000000000000;
export const TransitionLane16: Lane = /*                       */ 0b0000000001000000000000000000000;

export const RetryLanes: Lanes = /*                            */ 0b0000111110000000000000000000000;
export const RetryLane1: Lane = /*                             */ 0b0000000010000000000000000000000;
export const RetryLane2: Lane = /*                             */ 0b0000000100000000000000000000000;
export const RetryLane3: Lane = /*                             */ 0b0000001000000000000000000000000;
export const RetryLane4: Lane = /*                             */ 0b0000010000000000000000000000000;
export const RetryLane5: Lane = /*                             */ 0b0000100000000000000000000000000;

export const SomeRetryLane: Lane = RetryLane1;

export const SelectiveHydrationLane: Lane = /*          */ 0b0001000000000000000000000000000;

export const NonIdleLanes = /*                                 */ 0b0000111111111111111111111111111;

export const IdleHydrationLane: Lane = /*               */ 0b0001000000000000000000000000000;
const IdleLanes: Lanes = /*                             */ 0b0110000000000000000000000000000;
export const PingLane = /*                             */ 0b0010000000000000000000000000000;
export const OffscreenLane: Lane = /*                   */ 0b1000000000000000000000000000000;

export const DiscreteEventPriority = SyncLane;
export const ContinuousEventPriority = InputContinuousLane;
export const DefaultEventPriority = DefaultLane;
export const IdleEventPriority = IdleLanes;
