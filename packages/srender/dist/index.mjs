class Component {
  constructor(props, context) {
    this.props = props || {};
    this.context = context;
  }
  shouldComponentUpdate(props, state, nextContext) {
    return true;
  }
  componentDidMount() {}
  componentDidUpdate(props, state, snapshot) {}
  getSnapshotBeforeUpdate(prevProps, prevState) {}
  componentDidCatch(error, errorInfo) {}
  componentWillUnmount() {}
  destory() {
    this.componentWillUnmount();
  }
  setState(state) {
    // this.__fiber!.partialState = state;
    // batchUpdate({ from: ITag.CLASS_COMPONENT, fiber: this.__fiber! });
  }
  render() {
    throw new Error('render method should be implemented');
  }
}
function createInstance(fiber) {
  const Ctor = fiber.type;
  const instance = new Ctor(fiber.pendingProps, Ctor.contextType?.currentValue);
  instance.__fiber = fiber;
  return instance;
}

var FiberTag;
(function (FiberTag) {
  FiberTag["HostComponent"] = "Host";
  FiberTag["HostText"] = "HostText";
  FiberTag["ClassComponent"] = "Class";
  FiberTag["FunctionComponent"] = "Function";
  FiberTag["HostRoot"] = "Root";
  FiberTag["Fragment"] = "Fragment";
  FiberTag["Suspense"] = "Suspense";
  FiberTag["Offscreen"] = "Offscreen";
  FiberTag["ContextProvider"] = "ContextProvider";
  FiberTag["Unknown"] = "Unknown";
})(FiberTag || (FiberTag = {}));
var FiberFlags;
(function (FiberFlags) {
  FiberFlags[FiberFlags["NONE"] = 0] = "NONE";
  FiberFlags[FiberFlags["ShouldCapture"] = 1] = "ShouldCapture";
  FiberFlags[FiberFlags["DidCapture"] = 2] = "DidCapture";
  FiberFlags[FiberFlags["PerformWork"] = 4] = "PerformWork";
  FiberFlags[FiberFlags["Placement"] = 8] = "Placement";
  FiberFlags[FiberFlags["Deletion"] = 16] = "Deletion";
  FiberFlags[FiberFlags["Update"] = 32] = "Update";
})(FiberFlags || (FiberFlags = {}));
var UpdateState;
(function (UpdateState) {
  UpdateState[UpdateState["replaceState"] = 1] = "replaceState";
  UpdateState[UpdateState["updateState"] = 2] = "updateState";
  UpdateState[UpdateState["forceUpdate"] = 3] = "forceUpdate";
  UpdateState[UpdateState["captureState"] = 4] = "captureState";
})(UpdateState || (UpdateState = {}));
var Mode;
(function (Mode) {
  Mode[Mode["NoMode"] = 0] = "NoMode";
  Mode[Mode["Concurrent"] = 1] = "Concurrent";
})(Mode || (Mode = {}));

var ITag;
(function (ITag) {
  ITag["HOST_COMPONENT"] = "Host";
  ITag["HOST_TEXT"] = "HostText";
  ITag["CLASS_COMPONENT"] = "Class";
  ITag["FUNCTION_COMPONENT"] = "Function";
  ITag["HOST_ROOT"] = "Root";
  ITag["FRAGMENT"] = "Fragment";
  ITag["SUSPENSE"] = "Suspense";
  ITag["OFFSCREEN"] = "Offscreen";
  ITag["CONTEXT_PROVIDER"] = "ContextProvider";
  ITag["UNKNOWN"] = "Unknown";
})(ITag || (ITag = {}));
var Effect;
(function (Effect) {
  Effect[Effect["NOTHING"] = 0] = "NOTHING";
  Effect[Effect["PLACEMENT"] = 1] = "PLACEMENT";
  Effect[Effect["DELETION"] = 2] = "DELETION";
  Effect[Effect["UPDATE"] = 4] = "UPDATE";
})(Effect || (Effect = {}));
var Flags;
(function (Flags) {
  Flags[Flags["NONE"] = 0] = "NONE";
  Flags[Flags["ShouldCapture"] = 1] = "ShouldCapture";
  Flags[Flags["DidCapture"] = 2] = "DidCapture";
})(Flags || (Flags = {}));

function adjustHeap(list, parent, end, compare) {
  if (parent < 0) return;
  for (let i = 2 * parent + 1; i < end; i = i * 2 + 1) {
    if (i + 1 < end && compare(list[i], list[i + 1]) <= 0) i++;
    if (compare(list[i], list[parent]) > 0) swap(list, i, parent);
    parent = i;
  }
}
function swap(list, left, right) {
  let tmp = list[left];
  list[left] = list[right];
  list[right] = tmp;
}
function heapify(list, compare) {
  const {
    length: len
  } = list;
  const index = Math.floor(len / 2) - 1;
  for (let i = index; i >= 0; i--) adjustHeap(list, i, len, compare);
  return list;
}
class TaskQueue {
  static defaultCompareFn = (a, b) => b.sortIndex - a.sortIndex;
  constructor() {
    let {
      compare
    } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    this.list = [];
    this.compare = compare || TaskQueue.defaultCompareFn;
  }
  push(item) {
    const {
      list,
      compare
    } = this;
    list.push(item);
    const {
      length: len
    } = list;
    let i = len - 1;
    do {
      i = Math.floor((i + 1) / 2) - 1;
      adjustHeap(list, i, len, compare);
    } while (i > 0);
  }
  shift() {
    const {
      list,
      compare
    } = this;
    const item = list.shift();
    heapify(list, compare);
    return item;
  }
  pop() {
    return this.list.pop();
  }
  peek() {
    return this.list[0];
  }
}

const ImmediatePriority = 1;
const UserBlockingPriority = 2;
const NormalPriority = 3;
const LowPriority = 4;
const IdlePriority = 5;
const maxSigned31BitInt = 1073741823;
const IMMEDIATE_PRIORITY_TIMEOUT = -1;
const USER_BLOCKING_PRIORITY_TIMEOUT = 250;
const NORMAL_PRIORITY_TIMEOUT = 5000;
const LOW_PRIORITY_TIMEOUT = 10000;
const IDLE_PRIORITY_TIMEOUT = maxSigned31BitInt;
const taskQueue = new TaskQueue();
const timerQueue = new TaskQueue();
let currentTask = null;
let isPerformingWork = false;
let isHostCallbackScheduled = false;
let isHostTimeoutScheduled = false;
let taskIdCounter = 0;
let deadline = 0;
let yieldInterval = 5;
let requestHostCallback;
let scheduledHostCallback = null;
function timeoutForPriorityLevel(priorityLevel) {
  switch (priorityLevel) {
    case ImmediatePriority:
      return IMMEDIATE_PRIORITY_TIMEOUT;
    case UserBlockingPriority:
      return USER_BLOCKING_PRIORITY_TIMEOUT;
    case IdlePriority:
      return IDLE_PRIORITY_TIMEOUT;
    case LowPriority:
      return LOW_PRIORITY_TIMEOUT;
    case NormalPriority:
    default:
      return NORMAL_PRIORITY_TIMEOUT;
  }
}
const getCurrentTime = (() => {
  const initialTime = Date.now();
  const hasPerformanceNow = typeof performance === 'object' && typeof performance.now === 'function';
  if (hasPerformanceNow) return () => performance.now();else return () => Date.now() - initialTime;
})();
function push(queue, task) {
  queue.push(task);
}
function peek(queue) {
  return queue.peek();
}
function shift(queue) {
  return queue.shift();
}
function workLoop$1(hasTimeRemaining, initialTime) {
  let currentTime = getCurrentTime();
  advanceTimers(currentTime);
  currentTask = peek(taskQueue);
  while (currentTask) {
    const {
      callback
    } = currentTask;
    if (callback) {
      currentTask.callback = null;
      currentTask.priorityLevel;
      const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
      const continuationCallback = callback(didUserCallbackTimeout);
      currentTime = getCurrentTime();
      if (typeof continuationCallback === 'function') {
        currentTask.callback = continuationCallback;
        return true;
      } else if (currentTask === peek(taskQueue)) shift(taskQueue);
      advanceTimers(currentTime);
    } else {
      shift(taskQueue);
    }
    currentTask = peek(taskQueue);
  }
  if (currentTask) return true;else {
    const firstTimer = peek(timerQueue);
    if (firstTimer) requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
    return false;
  }
}
function flushWork(hasTimeRemaining, initialTime) {
  isHostCallbackScheduled = false;
  if (isHostTimeoutScheduled) {
    isHostTimeoutScheduled = false;
    cancelHostTimeout();
  }
  isPerformingWork = true;
  const res = workLoop$1();
  currentTask = null;
  isPerformingWork = false;
  return res;
}
function scheduleCallback(priorityLevel, callback, options) {
  const currentTime = getCurrentTime();
  let startTime,
    delay = 0;
  startTime = currentTime + delay;
  const timeout = timeoutForPriorityLevel(priorityLevel);
  const expirationTime = startTime + timeout;
  const newTask = {
    id: taskIdCounter++,
    callback,
    priorityLevel,
    startTime,
    expirationTime,
    sortIndex: -1
  };
  if (startTime > currentTime) {
    newTask.sortIndex = startTime;
    push(timerQueue, newTask);
    if (!peek(taskQueue) && newTask === peek(timerQueue)) {
      if (isHostTimeoutScheduled) cancelHostTimeout();else isHostTimeoutScheduled = true;
      requestHostTimeout(handleTimeout, startTime - currentTime);
    }
  } else {
    newTask.sortIndex = expirationTime;
    push(taskQueue, newTask);
    if (!isHostCallbackScheduled && !isPerformingWork) {
      isHostCallbackScheduled = true;
      requestHostCallback(flushWork);
    }
  }
  return newTask;
}
function shouldYieldToHost() {
  const res = getCurrentTime() - deadline > 0;
  return res;
}
const shouldYield = shouldYieldToHost;
const channel = new MessageChannel();
const port = channel.port2;
const performWorkUntilDeadline = () => {
  if (scheduledHostCallback) {
    const currentTime = getCurrentTime();
    deadline = currentTime + yieldInterval;
    const hasTimeRemaining = true;
    const hasMoreWork = scheduledHostCallback(hasTimeRemaining, currentTime);
    if (!hasMoreWork) {
      isMessageLoopRunning = false;
      scheduledHostCallback = null;
    } else {
      port.postMessage(null);
    }
  } else {
    isMessageLoopRunning = false;
  }
};
channel.port1.onmessage = performWorkUntilDeadline;
let isMessageLoopRunning = false;
requestHostCallback = function (callback) {
  scheduledHostCallback = callback;
  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true;
    port.postMessage(null);
  }
};
let taskTimeoutID;
function requestHostTimeout(callback, ms) {
  taskTimeoutID = setTimeout(() => callback(getCurrentTime()), ms);
}
function cancelHostTimeout() {
  clearTimeout(taskTimeoutID);
  taskTimeoutID = -1;
}
function handleTimeout(currentTime) {
  isHostTimeoutScheduled = false;
  advanceTimers(currentTime);
  if (!isHostCallbackScheduled) {
    if (peek(taskQueue)) {
      isHostCallbackScheduled = true;
      requestHostCallback(flushWork);
    } else {
      const firstTimer = peek(timerQueue);
      if (firstTimer) requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
    }
  }
}
function advanceTimers(currentTime) {
  let timer = peek(timerQueue);
  while (timer) {
    if (!timer.callback) {
      shift(timerQueue);
    } else if (timer.startTime <= currentTime) {
      shift(timerQueue);
      timer.sortIndex = timer.expirationTime;
      push(taskQueue, timer);
    } else return;
    timer = peek(timerQueue);
  }
}

// lane使用31位二进制来表示优先级车道共31条, 位数越小（1的位置越靠右）表示优先级越高
// 没有优先级
const NoLanes = /*                        */0b0000000000000000000000000000000;
const NoLane = /*                          */0b0000000000000000000000000000000;
// 同步优先级，表示同步的任务一次只能执行一个，例如：用户的交互事件产生的更新任务
const SyncLane = /*                        */0b0000000000000000000000000000001;
const InputContinuousLane = /*            */0b0000000000000000000000000000100;
const TransitionLanes = /*                       */0b0000000001111111111111111000000;
const TransitionLane1 = /*                        */0b0000000000000000000000001000000;
const NonIdleLanes = /*                                 */0b0000111111111111111111111111111;
const PingLane = /*                             */0b0010000000000000000000000000000;
const DiscreteEventPriority = SyncLane;
const ContinuousEventPriority = InputContinuousLane;

function isSubsetOfLanes(set, subset) {
  return (set & subset) === subset;
}
function mergeLanes(a, b) {
  return a | b;
}
function intersectLanes(a, b) {
  return a & b;
}
function getHighestPriorityLane(lanes) {
  return lanes & -lanes;
}
let currentIndex = 0;
let batchTransitionLane = NoLane;
function getTransitionLane() {
  const res = TransitionLane1 << currentIndex;
  currentIndex = (currentIndex + 1) % 16;
  return res;
}
function requestUpdateLane() {
  if (currentBatchConfig.transition) {
    batchTransitionLane = batchTransitionLane === NoLane || !isBatchingUpdates ? getTransitionLane() : batchTransitionLane;
    return batchTransitionLane;
  }
  return SyncLane;
}
function LaneToPriority(lane) {
  if (lane <= DiscreteEventPriority) return ImmediatePriority;
  if (lane <= ContinuousEventPriority) return UserBlockingPriority;
  if (lane & NonIdleLanes) return NormalPriority;
  return IdlePriority;
}

function createFiberNode(tag, pendingProps, options) {
  const {
    key,
    ref
  } = pendingProps;
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
function cloneFiberNode(oldFiber, pendingProps) {
  let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  const {
    key,
    ref
  } = pendingProps;
  const {
    child,
    sibling
  } = options;
  if (!child) options.child = null;
  if (!sibling) options.sibling = null;
  const fiber = Object.assign({
    key,
    ref
  }, oldFiber, options, pendingProps ? {
    pendingProps
  } : {});
  fiber.effects = [];
  fiber.flags = FiberFlags.Update;
  return fiber;
}

const resetHandlers = [];
function resetContext() {
  for (const fn of resetHandlers) fn();
}
const createContext = initialValue => {
  const $currentValue = createRef(initialValue);
  const stackValue = [initialValue];
  const Provider = _ref => {
    let {
      value,
      children
    } = _ref;
    stackValue.push(value);
    return children;
  };
  resetHandlers.push(() => stackValue.length = 1);
  const context = {
    get currentValue() {
      return stackValue[stackValue.length - 1];
    },
    pop() {
      stackValue.pop();
    },
    Provider,
    Consumer: _ref2 => {
      let {
        children
      } = _ref2;
      return children($currentValue.current);
    }
  };
  Provider._context = context;
  Provider.displayType = ContextProvider;
  return context;
};
function popProvider(context) {
  context.pop();
}

function markCurrentFiber(wip, old) {
  if (wip) wip.flags |= FiberFlags.PerformWork;
  if (old) old.flags &= ~FiberFlags.PerformWork;
}
function cloneChildren(wipFiber) {
  const oldFiber = wipFiber.alternate;
  if (!oldFiber.child) return;
  let oldChild = oldFiber.child;
  let prevChild = null;
  for (let i = 0; oldChild; i++, oldChild = oldChild.sibling) {
    const newChild = cloneFiberNode(oldChild, oldChild.pendingProps, {
      parent: wipFiber,
      index: i,
      alternate: oldChild
    });
    markCurrentFiber(newChild, oldChild);
    if (prevChild) prevChild.sibling = newChild;else wipFiber.child = newChild;
    prevChild = newChild;
    oldChild.alternate = null;
  }
}
function reconcileChildrenArray(wipFiber, newChildElements, lanes) {
  const elements = arrify(newChildElements);
  const needUpdate = !!intersectLanes(wipFiber.lanes, lanes);
  let oldFiber = wipFiber.alternate ? wipFiber.alternate.child : null;
  let newFiber = null;
  const map = new Map();
  for (let node = oldFiber, i = 0; node; node = node.sibling, i++) {
    const key = node.key || node.index;
    map.set(key, node);
  }
  for (let index = 0; index < elements.length; index++) {
    const prevFiber = newFiber;
    const element = elements[index];
    const key = element ? element.props.key || index : null;
    const oldFiber = map.get(key);
    if (oldFiber && oldFiber.type === element.type) {
      newFiber = cloneFiberNode(oldFiber, element.props, {
        parent: wipFiber,
        alternate: oldFiber,
        memoizedProps: oldFiber.pendingProps,
        index,
        lanes: needUpdate ? mergeLanes(lanes, oldFiber.lanes) : oldFiber.lanes
      });
      map.delete(key);
    } else {
      newFiber = createFiberNode(getTag(element), element.props, {
        parent: wipFiber,
        index,
        memoizedProps: element.props,
        type: element.type,
        lanes
      });
    }
    // markCurrentFiber(newFiber, oldFiber || null);
    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (prevFiber) prevFiber.sibling = newFiber;
  }
  for (const node of map.values()) deleteChild(node, wipFiber);
  map.clear();
}
function deleteChild(fiber, parent) {
  fiber.flags |= FiberFlags.Deletion;
  parent = parent || fiber.parent;
  if (parent) {
    parent.effects = parent.effects || [];
    parent.effects.push(fiber);
  }
}
const suspenseHandlers = [];
function getSuspenseHander() {
  return suspenseHandlers[suspenseHandlers.length - 1];
}
function popSuspenseHander() {
  suspenseHandlers.pop();
}
function pushSuspenseHander(fiber) {
  suspenseHandlers.push(fiber);
}
function clearSuspenseHander() {
  suspenseHandlers.length = 0;
}
function hideAllChildren(fiber) {
  let node = fiber.child;
  while (node) {
    console.log(node.stateNode, 'node');
    if (node.tag === FiberTag.HostComponent) {
      node.stateNode.style.display = 'none';
    } else {
      hideAllChildren(node);
    }
    node = node.sibling;
  }
}
function unhideAllChildren(fiber) {
  let node = fiber.child;
  while (node) {
    if (node.tag === FiberTag.HostComponent) {
      node.stateNode.style.display = '';
    } else {
      unhideAllChildren(node);
    }
    node = node.sibling;
  }
}
function unwindWork(fiber, lanes) {
  const flags = fiber.flags;
  if (lanes || lanes === NoLanes) {
    unwindWorks.push(fiber);
    if (fiber.parent) {
      const childEffects = fiber.effects || [];
      const thisEffect = fiber.flags > FiberFlags.PerformWork ? [fiber] : [];
      const parentEffects = fiber.parent.effects || [];
      fiber.parent.effects = parentEffects.concat(childEffects, thisEffect);
    } else {
      const root = fiber.stateNode;
      root.finishedWork = fiber;
    }
  }
  switch (fiber.tag) {
    case FiberTag.Suspense:
      popSuspenseHander();
      if (flags & Flags.ShouldCapture && !(flags & Flags.DidCapture)) {
        fiber.flags = flags & ~Flags.ShouldCapture | Flags.DidCapture;
      }
      return fiber;
    case FiberTag.ContextProvider:
      const ctx = fiber.type._context;
      popProvider(ctx);
      return;
  }
}
function unwindUnit(fiber, lanes) {
  fiber.lanes &= ~lanes;
  fiber.childLanes &= ~lanes;
  const oldFiber = fiber.alternate;
  if (oldFiber) oldFiber.alternate = fiber;
  markCurrentFiber(fiber, oldFiber);
  switch (fiber.tag) {
    case FiberTag.Offscreen:
      return fiber.pendingProps.mode === 'hidden' ? hideAllChildren(fiber) : unhideAllChildren(fiber);
  }
}
function _cloneChildren(firstChild, parent) {
  let next = firstChild;
  parent.child = firstChild;
  while (next) {
    next.parent = parent;
    next = next.sibling;
  }
}
function cloneFiberChildren(firstChild, parent) {
  cloneChildrenHandlers.push(() => _cloneChildren(firstChild, parent));
}
function getLatestFiber(fiber) {
  let node = fiber;
  while (node.alternate) {
    if (node.alternate.alternate === node) {
      if (node.alternate.flags & FiberFlags.PerformWork) node = node.alternate;
      break;
    }
    node = node.alternate;
  }
  return node;
}

function createUpdate(payload, eventTime, lane) {
  let tag = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : UpdateState.updateState;
  return {
    eventTime,
    lane,
    tag,
    payload,
    next: null
  };
}
function enqueueUpdate(queue, update) {
  const sharedQueue = queue.shared;
  const pending = sharedQueue.pending;
  if (!pending) {
    update.next = update;
  } else {
    update.next = pending.next;
    pending.next = update;
  }
  sharedQueue.pending = update;
}
function getStateFromUpdate(update, prevState, nextProps) {
  switch (update.tag) {
    case UpdateState.replaceState:
    case UpdateState.updateState:
      {
        const payload = update.payload;
        const partialState = typeof payload === 'function' ? payload(prevState, nextProps) : payload;
        return update.tag === UpdateState.replaceState ? partialState : Object.assign({}, prevState, partialState);
      }
    default:
      return prevState;
  }
}
function initializeUpdateQueue(memoizedState) {
  return {
    baseState: memoizedState,
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    shared: {
      pending: null
    },
    effects: []
  };
}
function processUpdateQueue(wip, hooks, queue, renderLanes) {
  if (!queue) return;
  let {
    firstBaseUpdate,
    lastBaseUpdate,
    shared
  } = queue;
  let pendingQueue = shared.pending;
  if (pendingQueue) {
    shared.pending = null;
    const lastPendingUpdate = pendingQueue;
    const firstPendingUpdate = lastPendingUpdate.next;
    lastPendingUpdate.next = null;
    if (lastBaseUpdate) {
      lastBaseUpdate.next = firstPendingUpdate;
    } else {
      firstBaseUpdate = firstPendingUpdate;
    }
    lastBaseUpdate = lastPendingUpdate;
  }
  if (firstBaseUpdate) {
    let newState = queue.baseState;
    let newBaseState = null;
    let newFirstBaseUpdate = null;
    let newLastBaseUpdate = null;
    let update = firstBaseUpdate;
    do {
      const updateLane = update.lane;
      if (!isSubsetOfLanes(renderLanes, updateLane)) {
        const clone = {
          eventTime: update.eventTime,
          lane: updateLane,
          tag: update.tag,
          payload: update.payload,
          next: null
        };
        if (!newLastBaseUpdate) {
          newFirstBaseUpdate = newLastBaseUpdate = clone;
          newBaseState = newState;
        } else {
          newLastBaseUpdate.next = clone;
          newLastBaseUpdate = newLastBaseUpdate.next;
        }
      } else {
        newState = getStateFromUpdate(update, newState, wip.pendingProps);
      }
      update = update.next;
    } while (update);
    if (!newLastBaseUpdate) {
      newBaseState = newState;
    }
    if (hooks) {
      hooks.state = newBaseState;
    } else {
      wip.memoizedState = newBaseState;
    }
    queue.baseState = newBaseState;
    queue.firstBaseUpdate = newFirstBaseUpdate;
    queue.lastBaseUpdate = newLastBaseUpdate;
  }
}
function markUpdateFromFiberToRoot(fiber) {
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
  const root = node.stateNode;
  root.pendingLanes = mergeLanes(node.lanes, node.childLanes);
  return root;
}
let isBatchingUpdates = false;
function batchedUpdates(fn, a) {
  const previousIsBatchingUpdates = isBatchingUpdates;
  isBatchingUpdates = true;
  try {
    return fn(a);
  } finally {
    isBatchingUpdates = previousIsBatchingUpdates;
    if (!isBatchingUpdates) {
      workInProgressRoot && ensureRootIsScheduled(workInProgressRoot);
    }
  }
}
function updateClassComponent(wipFiber, lanes) {
  const instance = wipFiber.stateNode;
  const Ctor = wipFiber.type;
  processUpdateQueue(wipFiber, null, wipFiber.updateQueue, lanes);
  let nextState = wipFiber.memoizedState;
  const nextContext = Ctor.contextType?.currentValue;
  if (!instance.shouldComponentUpdate(wipFiber.pendingProps, nextState, nextContext)) {
    return cloneChildren(wipFiber);
  }
  if (Ctor.getDerivedStateFromProps) {
    nextState = Ctor.getDerivedStateFromProps(wipFiber.pendingProps, nextState);
  }
  const prevState = instance.state;
  const prevProps = instance.props;
  instance.context = nextContext;
  instance.props = wipFiber.pendingProps;
  instance.state = nextState;
  wipFiber.memoizedState = nextState;
  reconcileChildrenArray(wipFiber, instance.render(), lanes);
  if (instance.getSnapshotBeforeUpdate) {
    instance._snapshot = instance.getSnapshotBeforeUpdate(prevProps, prevState);
  }
}
function updateSuspenseFallbackChildren(fiber, primaryChildren, fallbackChildren, lanes) {
  const oldFiber = fiber.alternate?.child;
  const offscreen = cloneFiberNode(oldFiber, {
    mode: 'hidden',
    children: primaryChildren
  }, {
    parent: fiber,
    index: 0,
    lanes,
    alternate: oldFiber
  });
  oldFiber.alternate = offscreen;
  const fallback = oldFiber.sibling ? cloneFiberNode(oldFiber.sibling, {
    children: fallbackChildren
  }, {
    parent: fiber,
    index: 1,
    lanes: mergeLanes(oldFiber.lanes, lanes)
  }) : createFiberNode(FiberTag.Fragment, {
    children: fallbackChildren
  }, {
    parent: fiber,
    index: 1,
    lanes
  });
  if (oldFiber.sibling) deleteChild(oldFiber.sibling, fiber);
  offscreen.sibling = fallback;
  fiber.child = offscreen;
}
function updateSuspensePrimaryChildren(fiber, primaryChildren, lanes) {
  const oldFiber = fiber.alternate?.child;
  const offscreen = cloneFiberNode(oldFiber, {
    mode: 'visible',
    children: primaryChildren
  }, {
    parent: fiber,
    index: 0,
    lanes,
    alternate: oldFiber
  });
  oldFiber.alternate = offscreen;
  oldFiber.sibling && deleteChild(oldFiber.sibling, fiber);
  fiber.child = offscreen;
}

const events = ['onCopy', 'onCopyCapture', 'onCutCapture', 'onPaste', 'onPasteCapture', 'onCompositionEnd', 'onCompositionEndCapture', 'onCompositionStart', 'onCompositionStartCapture', 'onCompositionUpdate', 'onCompositionUpdateCapture', 'onFocus', 'onCut', 'onFocusCapture', 'onBlur', 'onBlurCapture', 'onChange', 'onChangeCapture', 'onBeforeInput', 'onBeforeInputCapture', 'onInput', 'onInputCapture', 'onReset', 'onResetCapture', 'onSubmit', 'onSubmitCapture', 'onInvalid', 'onInvalidCapture', 'onLoad', 'onLoadCapture', 'onError', 'onErrorCapture', 'onKeyDown', 'onKeyDownCapture', 'onKeyPress', 'onKeyPressCapture', 'onKeyUp', 'onKeyUpCapture', 'onAbort', 'onAbortCapture', 'onCanPlay', 'onCanPlayCapture', 'onCanPlayThrough', 'onCanPlayThroughCapture', 'onDurationChange', 'onDurationChangeCapture', 'onEmptied', 'onEmptiedCapture', 'onEncrypted', 'onEncryptedCapture', 'onEnded', 'onEndedCapture', 'onLoadedData', 'onLoadedDataCapture', 'onLoadedMetadata', 'onLoadedMetadataCapture', 'onLoadStart', 'onLoadStartCapture', 'onPause', 'onPauseCapture', 'onPlay', 'onPlayCapture', 'onPlaying', 'onPlayingCapture', 'onProgress', 'onProgressCapture', 'onRateChange', 'onRateChangeCapture', 'onResize', 'onResizeCapture', 'onSeeked', 'onSeekedCapture', 'onSeeking', 'onSeekingCapture', 'onStalled', 'onStalledCapture', 'onSuspend', 'onSuspendCapture', 'onTimeUpdate', 'onTimeUpdateCapture', 'onVolumeChange', 'onVolumeChangeCapture', 'onWaiting', 'onWaitingCapture', 'onAuxClick', 'onAuxClickCapture', 'onClick', 'onClickCapture', 'onContextMenu', 'onContextMenuCapture', 'onDoubleClick', 'onDoubleClickCapture', 'onDrag', 'onDragCapture', 'onDragEnd', 'onDragEndCapture', 'onDragEnter', 'onDragEnterCapture', 'onDragExit', 'onDragExitCapture', 'onDragLeave', 'onDragLeaveCapture', 'onDragOver', 'onDragOverCapture', 'onDragStart', 'onDragStartCapture', 'onDrop', 'onDropCapture', 'onMouseDown', 'onMouseDownCapture', 'onMouseEnter', 'onMouseLeave', 'onMouseMove', 'onMouseMoveCapture', 'onMouseOut', 'onMouseOutCapture', 'onMouseOver', 'onMouseOverCapture', 'onMouseUp', 'onMouseUpCapture', 'onSelect', 'onSelectCapture', 'onTouchCancel', 'onTouchCancelCapture', 'onTouchEnd', 'onTouchEndCapture', 'onTouchMove', 'onTouchMoveCapture', 'onTouchStart', 'onTouchStartCapture', 'onPointerDown', 'onPointerDownCapture', 'onPointerMove', 'onPointerMoveCapture', 'onPointerUp', 'onPointerUpCapture', 'onPointerCancel', 'onPointerCancelCapture', 'onPointerEnter', 'onPointerLeave', 'onPointerOver', 'onPointerOverCapture', 'onPointerOut', 'onPointerOutCapture', 'onGotPointerCapture', 'onGotPointerCaptureCapture', 'onLostPointerCapture', 'onLostPointerCaptureCapture', 'onScroll', 'onScrollCapture', 'onWheel', 'onWheelCapture', 'onAnimationStart', 'onAnimationStartCapture', 'onAnimationEnd', 'onAnimationEndCapture', 'onAnimationIteration', 'onAnimationIterationCapture', 'onTransitionEnd', 'onTransitionEndCapture'];
const domMap = new WeakMap();
const registerEvent = root => {
  const listener = eventName => e => {
    const fiber = domMap.get(e.target);
    let current = fiber;
    while (current) {
      if (current.tag === FiberTag.HostComponent) {
        const handler = current.pendingProps[eventName];
        handler && batchedUpdates(handler, e);
      }
      current = current.parent;
    }
  };
  for (const eventName of events) {
    const event = eventName.toLowerCase().slice(2);
    root.addEventListener(event, listener(eventName), false);
  }
};

const blacklist = ['children', 'style', 'ref'];
const isEvent = name => name.startsWith('on');
const isAttribute = name => !(isEvent(name) || blacklist.includes(name));
// !isEvent(name) && name !== 'children' && name !== 'style';
const isNew = (prev, next) => key => prev[key] !== next[key];
const isGone = next => key => !(key in next);
function convertName(name) {
  return name === 'className' ? 'class' : name;
}
const svgElements = new Set(['svg', 'circle', 'rect', 'path', 'line', 'polygon', 'polyline', 'ellipse', 'g', 'text', 'tspan', 'defs', 'linearGradient', 'radialGradient', 'stop', 'use']);
function updateDomProperties(dom, prevProps, nextProps) {
  Object.keys(prevProps).filter(isAttribute).filter(isGone(nextProps)).forEach(name => {
    // (dom as IState)[name] = null;
    dom.removeAttribute(convertName(name));
  });
  Object.keys(nextProps).filter(isAttribute).filter(isNew(prevProps, nextProps)).forEach(name => {
    const value = nextProps[name];
    if (dom.nodeType === Node.TEXT_NODE) {
      dom[name] = value;
    } else if (svgElements.has(dom.tagName.toLowerCase()) && name !== 'xmlns') {
      // const svgPropName = name.replace(/(a-z)(A-Z)/g, '$1-$2').toLowerCase();
      dom.setAttributeNS(null, convertName(name), value);
    } else {
      dom.setAttribute(convertName(name), value);
    }
  });
  prevProps.style = prevProps.style || {};
  nextProps.style = nextProps.style || {};
  Object.keys(nextProps.style).filter(isNew(prevProps.style, nextProps.style)).forEach(key => {
    dom.style[key] = nextProps.style[key];
  });
  Object.keys(prevProps.style).filter(isGone(nextProps.style)).forEach(key => {
    dom.style[key] = '';
  });
}
function createDomElement(fiber) {
  const type = fiber.type;
  const isTextElement = fiber.type === TEXT_ELEMENT;
  const dom = fiber.type === 'svg' || svgElements.has(type) ? document.createElementNS(fiber.pendingProps.xmlns || 'http://www.w3.org/2000/svg', type) : isTextElement ? document.createTextNode('') : document.createElement(fiber.type);
  updateDomProperties(dom, {}, fiber.pendingProps);
  return dom;
}

function getHostParent(fiber) {
  let domParentFiber = fiber.parent;
  while (domParentFiber && domParentFiber.parent && domParentFiber.tag !== FiberTag.HostComponent && domParentFiber.tag !== FiberTag.HostText) {
    domParentFiber = domParentFiber.parent;
  }
  if (!domParentFiber) return fiber.stateNode;
  return domParentFiber.parent ? domParentFiber.stateNode : domParentFiber.stateNode.container;
}
function getHostSibling(fiber) {
  let node = fiber;
  siblings: while (true) {
    while (!node.sibling) {
      if (!node.parent || node.parent.tag === FiberTag.HostComponent) return null;
      node = node.parent;
    }
    node.sibling.parent = node.parent;
    node = node.sibling;
    while (node.tag !== FiberTag.HostComponent && node.tag !== FiberTag.HostText) {
      if (node.flags & FiberFlags.Placement || !node.child) continue siblings;
      node.child.parent = node;
      node = node.child;
    }
    if (!(node.flags & FiberFlags.Placement)) {
      return node.stateNode;
    }
  }
}
function callEffect(fiber) {
  let key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'create';
  let hook = fiber.memoizedState;
  while (hook) {
    const create = hook.state[key];
    if (typeof create === 'function') create();
    hook = hook.next;
  }
}
function commitPlacement(fiber) {
  const domParent = getHostParent(fiber);
  if ((fiber.tag === FiberTag.HostComponent || fiber.tag === FiberTag.HostText) && domParent) {
    const before = getHostSibling(fiber);
    const node = fiber.stateNode;
    if (before) domParent.insertBefore(node, before);else domParent.appendChild(node);
    if (fiber.ref) fiber.ref.current = fiber.stateNode;
  } else if (fiber.tag === FiberTag.ClassComponent) {
    fiber.stateNode.componentDidMount();
  } else if (fiber.tag === FiberTag.FunctionComponent) {
    callEffect(fiber);
  }
  fiber.flags &= ~FiberFlags.Placement;
}
function commitUpdate(fiber) {
  if (fiber.tag === FiberTag.HostComponent || fiber.tag === FiberTag.HostText) {
    updateDomProperties(fiber.stateNode, fiber.alternate.pendingProps, fiber.pendingProps);
  } else if (fiber.tag === FiberTag.FunctionComponent) {
    callEffect(fiber);
  } else if (fiber.tag === FiberTag.ClassComponent && fiber.stateNode instanceof Component) {
    const oldFiber = fiber.alternate;
    if (oldFiber) {
      fiber.stateNode.componentDidUpdate(oldFiber.pendingProps, oldFiber.stateNode.state);
    }
  }
  fiber.flags &= ~FiberFlags.Update;
}
function commitDeletion(fiber) {
  let node = fiber;
  const domParent = getHostParent(fiber);
  while (domParent) {
    if (!node) break;
    if (node.tag !== FiberTag.HostComponent && node.tag !== FiberTag.HostText) {
      node = node.child;
      continue;
    }
    domParent.removeChild(node.stateNode);
    while (node !== fiber && !node.sibling) node = node.parent;
    if (node === fiber) break;
    node = node.sibling;
  }
  const goStep = node => {
    if (node.child) return node.child;
    let cursor = node;
    while (cursor && cursor != fiber) {
      if (cursor.tag === FiberTag.FunctionComponent) callEffect(cursor, 'destroy');
      if (cursor.stateNode instanceof Component) cursor.stateNode.destory();
      if (cursor.sibling) return cursor.sibling;
      cursor = cursor.parent;
    }
  };
  while (node) node = goStep(node);
  fiber.flags &= ~FiberFlags.Deletion;
}
function commitWork(fiber) {
  if (fiber.tag === FiberTag.HostRoot) return;
  if (fiber.flags & FiberFlags.Placement) commitPlacement(fiber);
  if (fiber.flags & FiberFlags.Update) commitUpdate(fiber);
  if (fiber.flags & FiberFlags.Deletion) commitDeletion(fiber);
  fiber.effects = [];
}

let workInProgressHook = null;
let firstWorkInProgressHook = null;
let lastWorkInProgressHook = null;
let workInProgress = null;
function createWorkInProgress(wip) {
  workInProgressHook = firstWorkInProgressHook = wip.memoizedState;
  workInProgress = wip;
}
function createHooks(state) {
  return {
    state,
    baseState: null,
    baseUpdate: null,
    queue: null,
    next: null
  };
}
function createWorkInProgressHook(state) {
  if (!firstWorkInProgressHook) {
    firstWorkInProgressHook = workInProgressHook = createHooks(state);
    workInProgress.memoizedState = firstWorkInProgressHook;
  } else if (!workInProgressHook) {
    lastWorkInProgressHook.next = workInProgressHook = createHooks(state);
  }
  lastWorkInProgressHook = workInProgressHook;
  workInProgressHook = workInProgressHook.next;
  return lastWorkInProgressHook;
}
function processHookState(hook) {
  if (workInProgress.alternate) processUpdateQueue(workInProgress, hook, hook.queue, workInProgressRootRenderLanes);
}
function createUpdateQueue(hook) {
  hook.queue = initializeUpdateQueue(hook.state);
  hook.queue.dispatch = dispatchState.bind(null, workInProgress, hook);
}
function dispatchState(fiber, hook, state) {
  if (!fiber) return;
  const current = getLatestFiber(fiber);
  const lane = requestUpdateLane();
  current.lanes |= lane;
  const update = createUpdate(state, getCurrentTime(), lane, UpdateState.replaceState);
  enqueueUpdate(hook.queue, update);
  scheduleUpdateOnFiber(current);
}

function mountClassComponent(wipFiber, lanes) {
  const instance = wipFiber.stateNode = createInstance(wipFiber);
  const Ctor = wipFiber.type;
  let nextState = Object.assign({}, instance.state);
  const nextContext = Ctor.contextType?.currentValue;
  if (Ctor.getDerivedStateFromProps) nextState = Ctor.getDerivedStateFromProps(wipFiber.pendingProps, nextState);
  instance.context = nextContext;
  instance.props = wipFiber.pendingProps;
  instance.state = nextState;
  wipFiber.memoizedState = nextState;
  reconcileChildrenArray(wipFiber, instance.render(), lanes);
}
function mountSuspenseFallbackChildren(fiber, primaryChildren, fallbackChildren, lanes) {
  const offscreen = createFiberNode(FiberTag.Offscreen, {
    mode: 'hidden',
    children: primaryChildren
  }, {
    parent: fiber,
    index: 0,
    lanes
  });
  const fallback = createFiberNode(FiberTag.Fragment, {
    children: fallbackChildren
  }, {
    parent: fiber,
    index: 1,
    lanes
  });
  offscreen.sibling = fallback;
  fiber.child = offscreen;
}
function mountSuspensePrimaryChildren(fiber, primaryChildren, lanes) {
  const offscreen = createFiberNode(FiberTag.Offscreen, {
    mode: 'visible',
    children: primaryChildren
  }, {
    parent: fiber,
    lanes
  });
  fiber.child = offscreen;
}

function beginWork(wipFiber, renderLanes) {
  createWorkInProgress(wipFiber);
  if (!intersectLanes(wipFiber.lanes, renderLanes) && !intersectLanes(wipFiber.childLanes, renderLanes)) {
    cloneFiberChildren(wipFiber.alternate?.child || null, wipFiber);
    return true;
  }
  switch (wipFiber.tag) {
    case FiberTag.FunctionComponent:
    case FiberTag.ContextProvider:
      processFunctionComponent(wipFiber, renderLanes);
      break;
    case FiberTag.ClassComponent:
      processClassComponent(wipFiber, renderLanes);
      break;
    case FiberTag.Suspense:
      if (processSuspenseComponent(wipFiber, renderLanes)) return true;
      break;
    case FiberTag.Offscreen:
      if (processOffscreenComponent(wipFiber, renderLanes)) return true;
      break;
    case FiberTag.Fragment:
      reconcileChildrenArray(wipFiber, wipFiber.pendingProps?.children, renderLanes);
      break;
    case FiberTag.HostRoot:
    case FiberTag.HostComponent:
    case FiberTag.HostText:
      processHostComponent(wipFiber, renderLanes);
      break;
  }
  return false;
}
let flag = false;
function processOffscreenComponent(fiber, lanes) {
  let children = fiber.pendingProps.children;
  if (fiber.pendingProps.mode === 'hidden') {
    fiber.lanes |= PingLane;
    cloneFiberChildren(fiber.alternate?.child || null, fiber);
    return true;
  }
  if (intersectLanes(fiber.lanes, TransitionLanes) && flag) {
    flag = false;
    cloneFiberChildren(fiber.alternate?.child || null, fiber);
    return true;
  }
  reconcileChildrenArray(fiber, children, lanes);
}
function processSuspenseComponent(wipFiber, lanes) {
  const current = wipFiber.alternate;
  const nextPrimaryChildren = wipFiber.pendingProps.children;
  const nextFallbackChildren = wipFiber.pendingProps.fallback;
  let showFallback = false;
  const DidCapture = (wipFiber.flags & Flags.DidCapture) !== Flags.NONE;
  if (DidCapture) {
    if (intersectLanes(wipFiber.childLanes, TransitionLanes) && wipFiber.alternate) {
      cloneFiberChildren(wipFiber.alternate?.child, wipFiber);
      return true;
    }
    showFallback = true;
    wipFiber.flags &= ~FiberFlags.DidCapture;
  }
  pushSuspenseHander(wipFiber);
  if (current) {
    if (showFallback) updateSuspenseFallbackChildren(wipFiber, nextPrimaryChildren, nextFallbackChildren, lanes);else updateSuspensePrimaryChildren(wipFiber, nextPrimaryChildren, lanes);
  } else {
    if (showFallback) mountSuspenseFallbackChildren(wipFiber, nextPrimaryChildren, nextFallbackChildren, lanes);else mountSuspensePrimaryChildren(wipFiber, nextPrimaryChildren, lanes);
  }
  return false;
}
function processFunctionComponent(wipFiber, lanes) {
  const newChildElements = wipFiber.type(wipFiber.pendingProps);
  reconcileChildrenArray(wipFiber, newChildElements, lanes);
}
function processClassComponent(wipFiber, lanes) {
  if (wipFiber.alternate) updateClassComponent(wipFiber, lanes);else mountClassComponent(wipFiber, lanes);
}
function processHostComponent(wipFiber, lanes) {
  if (!wipFiber.stateNode) {
    wipFiber.stateNode = createDomElement(wipFiber);
    if (wipFiber.ref) wipFiber.ref.current = wipFiber.stateNode;
  }
  domMap.set(wipFiber.stateNode, wipFiber);
  const newChildElements = wipFiber.pendingProps.children;
  reconcileChildrenArray(wipFiber, newChildElements, lanes);
}

let nextUnitOfWork = null;
let workInProgressRoot = null;
let workInProgressRootRenderLanes = NoLanes;
let currentBatchConfig = {
  transition: null
};
let unwindWorks = [];
let cloneChildrenHandlers = [];
if (typeof window !== 'undefined') registerEvent(document.body);
function render(children, containerDom) {
  if (!containerDom) containerDom = document.createElement('div');
  let {
    __rootFiber: rootFiberNode
  } = containerDom;
  if (!rootFiberNode) rootFiberNode = containerDom.__rootFiber = createRootFiber(containerDom, Mode.NoMode);
  renderOnRootFiber(children, containerDom, rootFiberNode);
  return containerDom;
}
function createRoot() {
  const rootFiberNode = createRootFiber(null, Mode.Concurrent);
  return {
    render: (children, dom) => renderOnRootFiber(children, dom, rootFiberNode),
    unmount() {}
  };
}
function createRootFiber(container, mode) {
  return {
    container,
    mode,
    pendingLanes: NoLanes,
    expiredLanes: NoLanes,
    renderLanes: NoLanes,
    finishedWork: null,
    callbackNode: null,
    callbackId: NoLanes
  };
}
function renderOnRootFiber(children) {
  let dom = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  let rootFiberNode = arguments.length > 2 ? arguments[2] : undefined;
  const {
    container,
    current,
    mode
  } = rootFiberNode;
  if (!container) rootFiberNode.container = dom;
  const pendingProps = {
    children
  };
  const root = current ? cloneFiberNode(current, pendingProps, {
    child: current.child,
    sibling: current.sibling
  }) : createFiberNode(FiberTag.HostRoot, pendingProps, {
    stateNode: rootFiberNode,
    mode
  });
  rootFiberNode.current = root;
  rootFiberNode.pendingLanes |= SyncLane;
  root.lanes |= SyncLane;
  workInProgressRoot = rootFiberNode;
  scheduleOnRoot(rootFiberNode);
}
function scheduleOnRoot(root) {
  ensureRootIsScheduled(root);
}
function scheduleUpdateOnFiber(fiber) {
  const root = markUpdateFromFiberToRoot(fiber);
  workInProgressRoot = root;
  if (!root) return;
  if (!isBatchingUpdates) ensureRootIsScheduled(root);
}
function ensureRootIsScheduled(root) {
  const lanes = getNextLanes(root);
  workInProgressRootRenderLanes = lanes;
  root.pendingLanes &= ~lanes;
  if (root.callbackNode && lanes < root.callbackId) {
    root.callbackNode.callback = null;
    root.callbackNode = null;
    root.pendingLanes |= root.callbackId;
    root.callbackId = NoLanes;
    resetContext();
  }
  const priority = LaneToPriority(lanes);
  if (lanes === NoLanes) {
    return;
  } else if (lanes === SyncLane) {
    return performSyncWorkOnRoot(root);
  } else {
    root.callbackNode = scheduleCallback(priority, performConcurrentWorkOnRoot.bind(null, root));
    root.callbackId = lanes;
  }
}
function getNextLanes(root) {
  const pendingLanes = root.pendingLanes;
  return getHighestPriorityLane(pendingLanes);
}
function performSyncWorkOnRoot(root) {
  performWork(root, workLoopSync);
}
function performConcurrentWorkOnRoot(root) {
  return performWork(root, workLoop);
}
function prepareStack() {
  clearSuspenseHander();
  unwindWorks = [];
  cloneChildrenHandlers.length = 0;
}
function performWork(root, workLoop) {
  let {
    current
  } = root;
  if (!current) return;
  prepareStack();
  nextUnitOfWork = cloneFiberNode(current, current.pendingProps, {
    alternate: current
  });
  while (nextUnitOfWork) {
    try {
      return workLoop(root);
    } catch (error) {
      nextUnitOfWork = catchError(error, nextUnitOfWork);
    }
  }
}
function workLoopSync(root) {
  while (nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }
  const {
    finishedWork
  } = root;
  if (finishedWork) {
    commitAllWork(finishedWork);
  }
}
function workLoop(root) {
  while (nextUnitOfWork && !shouldYield()) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }
  const {
    finishedWork
  } = root;
  if (finishedWork) {
    commitAllWork(finishedWork);
  } else {
    let prevWork = nextUnitOfWork;
    return () => {
      nextUnitOfWork = prevWork;
      return workLoop(root);
    };
  }
}
function performUnitOfWork(wipFiber) {
  const skip = beginWork(wipFiber, workInProgressRootRenderLanes);
  wipFiber.memoizedProps = wipFiber.pendingProps;
  if (wipFiber.child && !skip) {
    return wipFiber.child;
  }
  let uow = wipFiber;
  while (uow) {
    completeWork(uow);
    if (uow.sibling) {
      return uow.sibling;
    }
    uow = uow.parent;
  }
}
function completeWork(fiber) {
  unwindWork(fiber, workInProgressRootRenderLanes);
}
function beforeCommit() {
  for (const fn of cloneChildrenHandlers) fn();
  for (const f of unwindWorks) unwindUnit(f, workInProgressRootRenderLanes);
}
function commitAllWork(fiber) {
  beforeCommit();
  (fiber.effects || []).forEach(f => commitWork(f));
  const root = fiber.stateNode;
  root.current = fiber;
  root.finishedWork = null;
  nextUnitOfWork = null;
  ensureRootIsScheduled(root);
}

function getNearestSuspense(fiber) {
  let node = fiber;
  while (node && node.tag !== FiberTag.Suspense) node = node.parent;
  return node ? getLatestFiber(node) : null;
}
function attachPingListener(fiber, promise) {
  const ping = () => {
    const suspense = getNearestSuspense(fiber);
    if (suspense) suspense.lanes |= fiber.lanes;
    const root = suspense ? markUpdateFromFiberToRoot(suspense) : null;
    root && ensureRootIsScheduled(root);
  };
  promise.then(ping, ping);
}
function catchError(error, fiber, lanes, errorInfo) {
  let component, ctor, handled;
  let needPing = true;
  if (error instanceof SuspenseException) {
    error = error.promise;
    const suspenseBoundary = getSuspenseHander();
    if (suspenseBoundary) {
      suspenseBoundary.flags |= Flags.ShouldCapture;
      if (suspenseBoundary.memoizedState === error) needPing = false;
      suspenseBoundary.memoizedState = error;
    }
  }
  if (error instanceof Promise && needPing) {
    attachPingListener(fiber, error);
  }
  for (let current = fiber; current; current = current.parent) {
    current.effects = []; // reset effect
    const next = unwindWork(current);
    if (next) return next;
    if ((component = fiber.stateNode) && component instanceof Component) {
      try {
        ctor = fiber.type;
        if (ctor && ctor.getDerivedStateFromError) {
          component.setState(ctor.getDerivedStateFromError(error));
          handled = true;
        }
        if (component.componentDidCatch) {
          component.componentDidCatch(error, errorInfo || {});
          handled = true;
        }
        if (handled) {
          return;
        }
      } catch (e) {
        error = e;
      }
    }
  }
  throw error;
}
class SuspenseException {
  constructor(promise) {
    this.promise = promise;
  }
}

function isSubclassOf(subClass, superClass) {
  let prototype = subClass.prototype ? Object.getPrototypeOf(subClass.prototype) : void 0;
  while (prototype) {
    if (prototype === superClass.prototype) {
      return true;
    }
    prototype = Object.getPrototypeOf(prototype);
  }
  return false;
}
const wait = (fn, time) => function () {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  return new Promise(resolve => {
    setTimeout(() => resolve(fn(...args)), time);
  });
};
const createRef = initialVal => {
  return {
    current: initialVal
  };
};
const forwardRef = render => props => render(props, props.ref);
const wrapPromise = promise => {
  let status = 'pending',
    result;
  const next = promise.then(res => {
    status = 'fulfilled';
    result = res;
  }, reason => {
    status = 'rejected';
    result = reason;
  });
  return {
    read() {
      switch (status) {
        case 'pending':
          throw new SuspenseException(next);
        case 'fulfilled':
          return result;
        case 'rejected':
        default:
          throw result;
      }
    }
  };
};
const lazy = load => {
  const p = load();
  const {
    read
  } = wrapPromise(p);
  return props => createElement(read().default, props);
};

const TEXT_ELEMENT = 'TEXT_ELEMENT';
const FRAGMENT = Symbol.for('srender.Fragment');
const ELEMENT = Symbol.for('srender.Element');
const SUSPENSE = Symbol.for('srender.Suspense');
const OFFSCREEN = Symbol.for('srender.Offscreen');
const ContextProvider = Symbol.for('srender.ContextProvider');
const getTag = _ref => {
  let {
    type,
    $$typeof
  } = _ref;
  switch ($$typeof) {
    case FRAGMENT:
      return FiberTag.Fragment;
    case SUSPENSE:
      return FiberTag.Suspense;
    case OFFSCREEN:
      return FiberTag.Offscreen;
    case ContextProvider:
      return FiberTag.ContextProvider;
  }
  if (typeof type === 'string') return type === TEXT_ELEMENT ? FiberTag.HostText : FiberTag.HostComponent;
  if (typeof type === 'function') return isSubclassOf(type, Component) ? FiberTag.ClassComponent : FiberTag.FunctionComponent;
  return FiberTag.Unknown;
};
function createElement(type) {
  let config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  let children = [];
  for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }
  if (typeof config !== 'object' || config?.$$typeof) {
    children = [config, ...args];
    config = {};
  } else if (Array.isArray(config)) {
    children = config;
    config = {};
  } else if (Array.isArray(args[0])) {
    children = args[0];
  } else if (config?.children) {
    config.key = config.key ? config.key : args[0] || void 0;
  } else {
    children = [...args];
  }
  if (config && (config.children || config.children === 0)) children = children.concat(config.children);
  const props = Object.assign({
    children: null
  }, config);
  // if (props.className) props.class = props.className;
  props.children = children.filter(c => c != undefined && c != null && c !== false).map(c => c?.$$typeof ? c : createTextElement(c));
  let node = {
    $$typeof: ELEMENT,
    props,
    type
  };
  if (typeof type === 'symbol') node.$$typeof = type;
  if (typeof type === 'function' && type.displayType === ContextProvider) node.$$typeof = ContextProvider;
  return node;
}
function arrify(val) {
  return val == null ? [] : Array.isArray(val) ? val : [val];
}
function createTextElement(value) {
  return createElement(TEXT_ELEMENT, {
    nodeValue: value
  });
}
function cloneElement(element, props) {
  return Object.assign({}, element, {
    props: {
      ...element.props,
      ...props
    }
  });
}
const forEach = (children, callback) => {
  children = arrify(children);
  for (let i = 0; i < children.length; i++) {
    callback(children[i], i);
  }
};
const map = (children, callback) => {
  children = arrify(children);
  const newChildren = [];
  for (let i = 0; i < children.length; i++) {
    newChildren.push(callback(children[i], i));
  }
  return newChildren;
};
const isValidElement = val => {
  if (typeof val !== 'object') return false;
  if (val.$$typeof) return true;
  return false;
};

const useRef = initValue => {
  const hook = createWorkInProgressHook({
    current: initValue
  });
  return hook.state;
};
const useState = initialState => {
  const hook = createWorkInProgressHook(typeof initialState === 'function' ? initialState() : initialState);
  if (!hook.queue) createUpdateQueue(hook);
  processHookState(hook);
  return [hook.state, hook.queue.dispatch];
};
function areDependenciesEqual(prevDeps, deps) {
  if (prevDeps === null) return false;
  if (!prevDeps && !deps) return false;
  if (!(Array.isArray(prevDeps) && Array.isArray(deps))) return false;
  for (let i = 0; i < deps.length; i++) {
    if (deps[i] !== prevDeps[i]) {
      return false;
    }
  }
  return true;
}
function callbackWrapper(callback, effectHook, deps) {
  let sync = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
  const res = areDependenciesEqual(effectHook.deps, deps) ? () => {} : sync ? () => {
    effectHook.destroy = callback();
  } : wait(() => effectHook.destroy = callback(), 17);
  effectHook.deps = deps;
  return res;
}
const useLayoutEffect = (callback, deps) => {
  const effectHook = {
    create: callback
  };
  const hook = createWorkInProgressHook(effectHook);
  hook.state.create = callbackWrapper(callback, hook.state, deps);
};
const useEffect = (callback, deps) => {
  const effectHook = {
    create: callback
  };
  const hook = createWorkInProgressHook(effectHook);
  hook.state.create = callbackWrapper(callback, hook.state, deps, false);
};
const useMemo = (callback, deps) => {
  const effectHook = {
    value: null
  };
  const hook = createWorkInProgressHook(effectHook);
  if (!areDependenciesEqual(hook.state.deps, deps)) {
    hook.state.value = callback();
  }
  hook.state.deps = deps;
  return hook.state.value;
};
const useCallback = (callback, deps) => useMemo(() => callback, deps);
const useContext = context => {
  return context.currentValue;
};
function _startTransition(setPending, fn) {
  setPending(true);
  const prevTransition = currentBatchConfig.transition;
  currentBatchConfig.transition = 1;
  setPending(false);
  fn();
  currentBatchConfig.transition = prevTransition;
}
function startTransition(fn) {
  _startTransition(() => {}, fn);
}
const useTransition = () => {
  const [isPending, setPending] = useState(false);
  return [isPending, _startTransition.bind(null, setPending)];
};

// export * from './interface';
const Children = {
  map,
  forEach
};
var index = {
  createElement,
  cloneElement,
  render,
  createRoot,
  Fragment: FRAGMENT,
  Component,
  forwardRef,
  Children,
  isValidElement,
  createRef,
  useEffect,
  useLayoutEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
  useContext,
  useTransition,
  startTransition,
  createContext,
  Offscreen: OFFSCREEN,
  Suspense: SUSPENSE,
  lazy
};

export { Children, Component, FRAGMENT as Fragment, OFFSCREEN as Offscreen, SUSPENSE as Suspense, cloneElement, createContext, createElement, createRef, createRoot, index as default, forwardRef, isValidElement, lazy, render, startTransition, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition, wrapPromise };
//# sourceMappingURL=index.mjs.map
