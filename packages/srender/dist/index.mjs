var ITag;
(function (ITag) {
  ITag["HOST_COMPONENT"] = "host";
  ITag["HOST_TEXT"] = "host_text";
  ITag["CLASS_COMPONENT"] = "class";
  ITag["FUNCTION_COMPONENT"] = "function";
  ITag["HOST_ROOT"] = "root";
  ITag["FRAGMENT"] = "fragment";
  ITag["UNKNOWN"] = "unknown";
})(ITag || (ITag = {}));
var Effect;
(function (Effect) {
  Effect[Effect["NOTHING"] = 0] = "NOTHING";
  Effect[Effect["PLACEMENT"] = 1] = "PLACEMENT";
  Effect[Effect["DELETION"] = 2] = "DELETION";
  Effect[Effect["UPDATE"] = 4] = "UPDATE";
})(Effect || (Effect = {}));

const TEXT_ELEMENT = 'TEXT ELEMENT';
const FRAGMENT = Symbol.for('srender.fragment');
const ELEMENT = Symbol.for('srender.element');
const getTag = _ref => {
  let {
    type,
    $$typeof
  } = _ref;
  if (typeof type === 'string') return type === TEXT_ELEMENT ? ITag.HOST_TEXT : ITag.HOST_COMPONENT;else if (typeof type === 'function') return ITag.FUNCTION_COMPONENT;else if ($$typeof === FRAGMENT) return ITag.FRAGMENT;else return ITag.UNKNOWN;
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
  } else {
    children = [...args];
  }
  const props = Object.assign({}, config);
  props.children = children.filter(c => c != undefined && c != null && c !== false).map(c => c?.$$typeof ? c : createTextElement(c));
  let node = {
    $$typeof: ELEMENT,
    props
  };
  if (type === FRAGMENT) {
    node.$$typeof = FRAGMENT;
  } else {
    node.type = type;
  }
  return node;
}
function createTextElement(value) {
  return createElement(TEXT_ELEMENT, {
    nodeValue: value
  });
}

let currentFiber = {
  current: null
};
function initHooks(fiber) {
  if (!fiber) return {};
  let {
    refs,
    states,
    effects,
    layoutEffects
  } = fiber.hooks;
  if (refs) refs.index = 0;
  if (states) states.index = 0;
  if (effects) effects.index = 0;
  if (layoutEffects) layoutEffects.index = 0;
  return {
    refs,
    states,
    effects,
    layoutEffects
  };
}
function setCurrentFiber(wip) {
  currentFiber.current = wip;
}
function getCurrentFiber() {
  return currentFiber.current;
}
const useRef = initValue => {
  const wip = getCurrentFiber();
  let {
    refs
  } = wip.hooks;
  if (!refs) wip.hooks.refs = refs = {
    index: 0,
    values: []
  };
  if (refs.index >= refs.values.length) refs.values.push({
    current: initValue || null
  });
  return refs.values[refs.index++];
};
const useState = initalState => {
  const wip = getCurrentFiber();
  const currentFiber = useRef(wip);
  currentFiber.current = wip;
  let {
    states
  } = wip.hooks;
  if (!states) wip.hooks.states = states = {
    index: 0,
    values: []
  };
  if (states.index >= states.values.length) states.values.push(initalState);
  const index = states.index;
  const setState = st => {
    states.values[index] = st;
    batchUpdate({
      from: ITag.FUNCTION_COMPONENT,
      fiber: currentFiber.current
    });
  };
  return [states.values[states.index++], setState];
};
function areDependenciesEqual(prevDeps, deps) {
  if (prevDeps === null) return false;
  for (let i = 0; i < deps.length; i++) {
    if (deps[i] !== prevDeps[i]) {
      return false;
    }
  }
  return true;
}
const useLayoutEffect = (callback, deps) => {
  const wip = getCurrentFiber();
  const $deps = useRef(deps);
  let {
    layoutEffects
  } = wip.hooks;
  if (!layoutEffects) wip.hooks.layoutEffects = layoutEffects = {
    index: 0,
    values: []
  };
  if (layoutEffects.index >= layoutEffects.values.length) layoutEffects.values.push({
    callback,
    canRun: true
  });else if (!areDependenciesEqual($deps.current, deps)) {
    layoutEffects.values[layoutEffects.index] = {
      callback,
      canRun: true
    };
  } else {
    layoutEffects.values[layoutEffects.index].canRun = false;
  }
};
const useEffect = (callback, deps) => {
  const wip = getCurrentFiber();
  const $deps = useRef(deps);
  let {
    effects
  } = wip.hooks;
  if (!effects) wip.hooks.effects = effects = {
    index: 0,
    values: []
  };
  if (effects.index >= effects.values.length) effects.values.push({
    callback,
    canRun: true
  });else if (!areDependenciesEqual($deps.current, deps)) {
    effects.values[effects.index] = {
      callback,
      canRun: true
    };
  } else {
    effects.values[effects.index].canRun = false;
  }
};
const useMemo = (callback, deps) => {
  const cachedValue = useRef();
  const cachedDeps = useRef(deps);
  if (cachedValue.current) {
    if (!areDependenciesEqual(cachedDeps.current, deps)) cachedValue.current = callback();
  } else {
    cachedValue.current = callback();
  }
  return cachedValue.current;
};

const isEvent = name => name.startsWith('on');
const isAttribute = name => !isEvent(name) && name !== 'children' && name !== 'style';
const isNew = (prev, next) => key => prev[key] !== next[key];
const isGone = next => key => !(key in next);
function updateDomProperties(dom, prevProps, nextProps) {
  Object.keys(prevProps).filter(isAttribute).filter(isGone(nextProps)).forEach(name => {
    dom[name] = null;
    // dom.removeAttribute(name);
  });
  Object.keys(nextProps).filter(isAttribute).filter(isNew(prevProps, nextProps)).forEach(name => {
    // console.log(dom, dom.setAttribute, 'dom.');
    dom[name] = nextProps[name];
    // dom.setAttribute(name, nextProps[name]);
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
  const isTextElement = fiber.type === TEXT_ELEMENT;
  const dom = isTextElement ? document.createTextNode('') : document.createElement(fiber.type);
  updateDomProperties(dom, [], fiber.props);
  return dom;
}
function cloneFiber(oldFiber, parent, index, props) {
  if (!props) props = oldFiber.props;
  return {
    type: oldFiber.type,
    tag: oldFiber.tag,
    stateNode: oldFiber.stateNode,
    hooks: initHooks(oldFiber),
    index,
    parent: parent,
    alternate: oldFiber,
    $$typeof: oldFiber.$$typeof,
    props,
    partialState: oldFiber.partialState,
    effectTag: Effect.UPDATE
  };
}
function createFiber(element, parent, index) {
  return {
    type: element.type,
    $$typeof: element.$$typeof,
    tag: getTag(element),
    props: element.props,
    hooks: initHooks(),
    parent,
    index,
    effectTag: Effect.PLACEMENT
  };
}

const events = ['onCopy', 'onCopyCapture', 'onCutCapture', 'onPaste', 'onPasteCapture', 'onCompositionEnd', 'onCompositionEndCapture', 'onCompositionStart', 'onCompositionStartCapture', 'onCompositionUpdate', 'onCompositionUpdateCapture', 'onFocus', 'onCut', 'onFocusCapture', 'onBlur', 'onBlurCapture', 'onChange', 'onChangeCapture', 'onBeforeInput', 'onBeforeInputCapture', 'onInput', 'onInputCapture', 'onReset', 'onResetCapture', 'onSubmit', 'onSubmitCapture', 'onInvalid', 'onInvalidCapture', 'onLoad', 'onLoadCapture', 'onError', 'onErrorCapture', 'onKeyDown', 'onKeyDownCapture', 'onKeyPress', 'onKeyPressCapture', 'onKeyUp', 'onKeyUpCapture', 'onAbort', 'onAbortCapture', 'onCanPlay', 'onCanPlayCapture', 'onCanPlayThrough', 'onCanPlayThroughCapture', 'onDurationChange', 'onDurationChangeCapture', 'onEmptied', 'onEmptiedCapture', 'onEncrypted', 'onEncryptedCapture', 'onEnded', 'onEndedCapture', 'onLoadedData', 'onLoadedDataCapture', 'onLoadedMetadata', 'onLoadedMetadataCapture', 'onLoadStart', 'onLoadStartCapture', 'onPause', 'onPauseCapture', 'onPlay', 'onPlayCapture', 'onPlaying', 'onPlayingCapture', 'onProgress', 'onProgressCapture', 'onRateChange', 'onRateChangeCapture', 'onResize', 'onResizeCapture', 'onSeeked', 'onSeekedCapture', 'onSeeking', 'onSeekingCapture', 'onStalled', 'onStalledCapture', 'onSuspend', 'onSuspendCapture', 'onTimeUpdate', 'onTimeUpdateCapture', 'onVolumeChange', 'onVolumeChangeCapture', 'onWaiting', 'onWaitingCapture', 'onAuxClick', 'onAuxClickCapture', 'onClick', 'onClickCapture', 'onContextMenu', 'onContextMenuCapture', 'onDoubleClick', 'onDoubleClickCapture', 'onDrag', 'onDragCapture', 'onDragEnd', 'onDragEndCapture', 'onDragEnter', 'onDragEnterCapture', 'onDragExit', 'onDragExitCapture', 'onDragLeave', 'onDragLeaveCapture', 'onDragOver', 'onDragOverCapture', 'onDragStart', 'onDragStartCapture', 'onDrop', 'onDropCapture', 'onMouseDown', 'onMouseDownCapture', 'onMouseEnter', 'onMouseLeave', 'onMouseMove', 'onMouseMoveCapture', 'onMouseOut', 'onMouseOutCapture', 'onMouseOver', 'onMouseOverCapture', 'onMouseUp', 'onMouseUpCapture', 'onSelect', 'onSelectCapture', 'onTouchCancel', 'onTouchCancelCapture', 'onTouchEnd', 'onTouchEndCapture', 'onTouchMove', 'onTouchMoveCapture', 'onTouchStart', 'onTouchStartCapture', 'onPointerDown', 'onPointerDownCapture', 'onPointerMove', 'onPointerMoveCapture', 'onPointerUp', 'onPointerUpCapture', 'onPointerCancel', 'onPointerCancelCapture', 'onPointerEnter', 'onPointerLeave', 'onPointerOver', 'onPointerOverCapture', 'onPointerOut', 'onPointerOutCapture', 'onGotPointerCapture', 'onGotPointerCaptureCapture', 'onLostPointerCapture', 'onLostPointerCaptureCapture', 'onScroll', 'onScrollCapture', 'onWheel', 'onWheelCapture', 'onAnimationStart', 'onAnimationStartCapture', 'onAnimationEnd', 'onAnimationEndCapture', 'onAnimationIteration', 'onAnimationIterationCapture', 'onTransitionEnd', 'onTransitionEndCapture'];
const domMap = new WeakMap();
const registerEvent = root => {
  const listener = eventName => e => {
    const fiber = domMap.get(e.target);
    let curent = fiber;
    while (curent) {
      const handler = curent.props[eventName];
      if (handler) {
        handler(e);
      }
      curent = curent.parent;
    }
  };
  for (const eventName of events) {
    const event = eventName.toLowerCase().slice(2);
    root.addEventListener(event, listener(eventName), {
      capture: false
    });
  }
};

const wait = (fn, time) => function () {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  return new Promise(resolve => {
    setTimeout(() => resolve(fn(...args)), time);
  });
};

const ENOUGH_TIME = 1;
const updateQueue = [];
let nextUnitOfWork = null;
let pendingCommit = null;
function render(elements, containerDom) {
  let sync = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  if (!containerDom) containerDom = document.createElement('div');
  updateQueue.push({
    from: ITag.HOST_ROOT,
    dom: containerDom,
    newProps: {
      children: elements
    }
  });
  if (!containerDom._rootContainerFiber) registerEvent(containerDom);
  if (sync) performWork({
    timeRemaining: () => 1000,
    didTimeout: false
  });else requestIdleCallback(performWork);
  return containerDom;
}
function batchUpdate(update) {
  updateQueue.push(update);
  requestIdleCallback(performWork);
}
function performWork(deadline) {
  workLoop(deadline);
  if (nextUnitOfWork || updateQueue.length > 0) {
    requestIdleCallback(performWork);
  }
}
function workLoop(deadline) {
  if (!nextUnitOfWork) {
    resetNextUnitOfWork();
  }
  while (nextUnitOfWork && deadline.timeRemaining() > ENOUGH_TIME) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }
  if (pendingCommit) {
    commitAllWork(pendingCommit);
  }
}
function resetNextUnitOfWork() {
  const update = updateQueue.shift();
  if (!update) {
    return;
  }
  const root = update.from === ITag.HOST_ROOT ? update.dom._rootContainerFiber : getRoot(update.fiber);
  nextUnitOfWork = {
    tag: ITag.HOST_ROOT,
    $$typeof: ELEMENT,
    hooks: {},
    index: 0,
    stateNode: update.dom || root.stateNode,
    effectTag: Effect.NOTHING,
    props: update.newProps || root.props,
    alternate: root
  };
}
function getRoot(fiber) {
  let node = fiber;
  while (node.parent) {
    node = node.parent;
  }
  return node;
}
function performUnitOfWork(wipFiber) {
  beginWork(wipFiber);
  if (wipFiber.child) {
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
function beginWork(wipFiber) {
  setCurrentFiber(wipFiber);
  switch (wipFiber.tag) {
    case ITag.FUNCTION_COMPONENT:
      updateFunctionComponent(wipFiber);
      break;
    case ITag.HOST_ROOT:
    case ITag.HOST_COMPONENT:
    case ITag.HOST_TEXT:
      updateHostComponent(wipFiber);
      break;
  }
  if (wipFiber.$$typeof === FRAGMENT) reconcileChildrenArray(wipFiber, wipFiber.props.children);
}
function updateFunctionComponent(wipFiber) {
  const newChildElements = wipFiber.type(wipFiber.props);
  reconcileChildrenArray(wipFiber, newChildElements);
}
function updateHostComponent(wipFiber) {
  if (!wipFiber.stateNode) {
    wipFiber.stateNode = createDomElement(wipFiber);
  }
  const newChildElements = wipFiber.props.children;
  reconcileChildrenArray(wipFiber, newChildElements);
}
function arrify(val) {
  return val == null ? [] : Array.isArray(val) ? val : [val];
}
function reconcileChildrenArray(wipFiber, newChildElements) {
  const elements = arrify(newChildElements);
  let oldFiber = wipFiber.alternate ? wipFiber.alternate.child : null;
  let newFiber = null;
  const map = new Map();
  for (let node = oldFiber, i = 0; node; node = node.sibling, i++) {
    const key = node.props.key || node.index;
    map.set(key, node);
  }
  for (let index = 0; index < elements.length; index++) {
    const prevFiber = newFiber;
    const element = elements[index];
    const key = element ? element.props.key || index : null;
    const oldFiber = map.get(key);
    if (oldFiber && oldFiber.type === element.type) {
      newFiber = cloneFiber(oldFiber, wipFiber, index, element.props);
      map.delete(key);
    } else {
      newFiber = createFiber(element, wipFiber, index);
    }
    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (prevFiber) prevFiber.sibling = newFiber;
  }
  for (const node of map.values()) deleteChild(node, wipFiber);
  map.clear();
}
function deleteChild(fiber, parent) {
  fiber.effectTag |= Effect.DELETION;
  parent = parent || fiber.parent;
  if (parent) {
    parent.effects = parent.effects || [];
    parent.effects.push(fiber);
  }
}
function completeWork(fiber) {
  if (fiber.parent) {
    const childEffects = fiber.effects || [];
    const thisEffect = fiber.effectTag ? [fiber] : [];
    const parentEffects = fiber.parent.effects || [];
    fiber.parent.effects = parentEffects.concat(childEffects, thisEffect);
  } else {
    pendingCommit = fiber;
  }
}
function commitAllWork(fiber) {
  (fiber.effects || []).forEach(f => commitWork(f));
  fiber.stateNode._rootContainerFiber = fiber;
  nextUnitOfWork = null;
  pendingCommit = null;
}
function commitWork(fiber) {
  if (fiber.tag === ITag.HOST_ROOT || !fiber.effectTag) return;
  if (fiber.effectTag & Effect.PLACEMENT) commitPlacement(fiber);
  if (fiber.effectTag & Effect.UPDATE) commitUpdate(fiber);
  if (fiber.effectTag & Effect.DELETION) commitDeletion(fiber);
}
function getHostParent(fiber) {
  let domParentFiber = fiber.parent;
  if (!domParentFiber) return fiber.stateNode;
  while (domParentFiber.tag === ITag.FUNCTION_COMPONENT || domParentFiber.tag === ITag.FRAGMENT) {
    domParentFiber = domParentFiber.parent;
  }
  return domParentFiber.stateNode;
}
function getHostSibling(fiber) {
  let node = fiber;
  siblings: while (true) {
    while (!node.sibling) {
      if (!node.parent || node.parent.tag === ITag.HOST_COMPONENT) return null;
      node = node.parent;
    }
    node.sibling.parent = node.parent;
    node = node.sibling;
    while (node.tag !== ITag.HOST_COMPONENT && node.tag !== ITag.HOST_TEXT) {
      if (node.effectTag & Effect.PLACEMENT || !node.child) continue siblings;
      node.child.parent = node;
      node = node.child;
    }
    if (!(node.effectTag & Effect.PLACEMENT)) {
      return node.stateNode;
    }
  }
}
function commitPlacement(fiber) {
  const domParent = getHostParent(fiber);
  if (fiber.tag === ITag.HOST_COMPONENT || fiber.tag === ITag.HOST_TEXT) {
    const before = getHostSibling(fiber);
    const node = fiber.stateNode;
    domMap.set(node, fiber);
    if (before) domParent.insertBefore(node, before);else domParent.appendChild(node);
    if (fiber.props.ref) fiber.props.ref.current = fiber.stateNode;
  } else if (fiber.tag === ITag.FUNCTION_COMPONENT) {
    let {
      effects,
      layoutEffects,
      destroy
    } = fiber.hooks;
    if (!destroy) fiber.hooks.destroy = destroy = [];
    effects?.values.forEach(async _ref => {
      let {
        callback,
        canRun
      } = _ref;
      if (canRun) {
        const unMount = await wait(callback, 17)();
        if (unMount) destroy.push(unMount);
      }
    });
    layoutEffects?.values.forEach(_ref2 => {
      let {
        callback,
        canRun
      } = _ref2;
      if (canRun) {
        const unMount = callback();
        if (unMount) destroy.push(unMount);
      }
    });
  }
  fiber.effectTag &= ~Effect.PLACEMENT;
}
function commitUpdate(fiber) {
  if (fiber.tag === ITag.HOST_COMPONENT) {
    updateDomProperties(fiber.stateNode, fiber.alternate.props, fiber.props);
  } else if (fiber.tag === ITag.FUNCTION_COMPONENT) {
    const {
      effects,
      layoutEffects
    } = fiber.hooks;
    effects?.values.forEach(async _ref3 => {
      let {
        callback,
        canRun
      } = _ref3;
      if (canRun) await wait(callback, 17)();
    });
    layoutEffects?.values.forEach(_ref4 => {
      let {
        callback,
        canRun
      } = _ref4;
      if (canRun) callback();
    });
  }
  fiber.effectTag &= ~Effect.UPDATE;
}
function commitDeletion(fiber) {
  let node = fiber;
  const domParent = getHostParent(fiber);
  while (true) {
    if (node?.tag === ITag.FUNCTION_COMPONENT || node?.tag === ITag.FRAGMENT) {
      node = node?.child;
      continue;
    }
    domParent.removeChild(node?.stateNode);
    while (node !== fiber && !node?.sibling) node = node?.parent;
    if (node === fiber) break;
    node = node.sibling;
  }
  const goStep = node => {
    if (node.child) return node.child;
    let cursor = node;
    while (cursor && cursor != fiber) {
      if (cursor.hooks.destroy) cursor.hooks.destroy.forEach(f => f());
      if (cursor.sibling) return cursor.sibling;
      cursor = cursor.parent;
    }
  };
  while (node) node = goStep(node);
  fiber.effectTag &= ~Effect.DELETION;
}

var index = {
  createElement,
  render,
  Fragment: FRAGMENT
};

export { FRAGMENT as Fragment, createElement, index as default, initHooks, render, setCurrentFiber, useEffect, useLayoutEffect, useMemo, useRef, useState };
//# sourceMappingURL=index.mjs.map
