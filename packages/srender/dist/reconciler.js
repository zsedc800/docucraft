import { createInstance } from './component';
import { createDomElement, updateDomProperties } from './domUtils';
import { getTag } from './element';
import { initHooks, setCurrentFiber } from './hooks';
import { Effect, ITag } from './interface';
import { wait } from './utils';
const ENOUGH_TIME = 1;
const updateQueue = [];
let nextUnitOfWork = null;
let pendingCommit = null;
/**
 * 把 virtual DOM tree（可以是数组）渲染到对应的容器 DOM
 * @param elements VNode elements to render
 * @param containerDom container dom element
 */
export function render(elements, containerDom) {
    updateQueue.push({
        from: ITag.HOST_ROOT,
        dom: containerDom,
        newProps: { children: elements }
    });
    requestIdleCallback(performWork);
}
/**
 * 安排更新，通常是由 setState 调用。
 * @param instance 组件实例
 * @param partialState state，通常是对象
 */
export function scheduleUpdate(instance, partialState) {
    updateQueue.push({
        from: ITag.CLASS_COMPONENT,
        instance,
        partialState
    });
    requestIdleCallback(performWork);
}
export function batchUpdate(update) {
    updateQueue.push(update);
    requestIdleCallback(performWork);
}
/**
 * 执行渲染/更新工作
 * @param {IdleDeadline} deadline requestIdleCallback 传来，用于检测空闲时间
 */
function performWork(deadline) {
    workLoop(deadline);
    if (nextUnitOfWork || updateQueue.length > 0) {
        requestIdleCallback(performWork);
    }
}
/**
 * 核心功能，把更新工作分片处理（可打断）；处理结束后进入提交阶段（不可打断）。
 *
 * 1. 通过 deadline 去查看剩余可执行时间，时间不够时暂停处理；
 * 2. 把 wip fiber tree 的创建工作分片处理（可分片/暂停，因为没有操作DOM）；
 * 3. 一旦 wip fiber tree 创建完毕，同步执行 DOM 更新。
 * @param {IdleDeadline} deadline requestIdleCallback() 的参数
 */
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
/**
 * 重新开始分片工作 （next unit of work），设置reconciler的起点。
 */
function resetNextUnitOfWork() {
    const update = updateQueue.shift();
    if (!update) {
        return;
    }
    if (update.partialState) {
        update.instance.__fiber.partialState =
            update.partialState;
    }
    const root = update.from === ITag.HOST_ROOT
        ? update.dom._rootContainerFiber
        : getRoot(update.fiber || update.instance.__fiber);
    nextUnitOfWork = {
        tag: ITag.HOST_ROOT,
        hooks: {},
        stateNode: update.dom || root.stateNode,
        props: update.newProps || root.props,
        alternate: root
    };
}
/**
 * 对当前 fiber 取 root （通过 fiber 的 parent 属性）
 * @param {IFiber} fiber fiber 对象
 */
function getRoot(fiber) {
    let node = fiber;
    while (node.parent) {
        node = node.parent;
    }
    return node;
}
/**
 * 迭代创建 work-in-progress fiber
 * @param wipFiber work-in-progress fiber
 */
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
/**
 * 为 fiber 创建 children fibers
 *
 * 1. 创建 stateNode 如果 wipFiber 没有的话；
 * 2. 对 wipFiber 的 children 执行 reconcileChildrenArray。
 * @param {IFiber} wipFiber 当前 work-in-progress fiber
 */
function beginWork(wipFiber) {
    setCurrentFiber(wipFiber);
    switch (wipFiber.tag) {
        case ITag.CLASS_COMPONENT:
            updateClassComponent(wipFiber);
            break;
        case ITag.FUNCTION_COMPONENT:
            updateFunctionComponent(wipFiber);
            break;
        case ITag.HOST_ROOT:
        case ITag.HOST_COMPONENT:
            updateHostComponent(wipFiber);
            break;
    }
}
function updateFunctionComponent(wipFiber) {
    const newChildElements = wipFiber.type(wipFiber.props);
    reconcileChildrenArray(wipFiber, newChildElements);
}
/**
 * 处理 host component 和 root component（即都 host/原生 组件）。
 * @param wipFiber 当前 work-in-progress fiber
 */
function updateHostComponent(wipFiber) {
    if (!wipFiber.stateNode) {
        wipFiber.stateNode = createDomElement(wipFiber);
    }
    const newChildElements = wipFiber.props.children;
    reconcileChildrenArray(wipFiber, newChildElements);
}
/**
 * 处理 class component（即用户自定义的组件）。
 * @param wipFiber 当前 work-in-progress fiber
 */
function updateClassComponent(wipFiber) {
    let instance = wipFiber.stateNode;
    if (instance == null) {
        instance = wipFiber.stateNode = createInstance(wipFiber);
    }
    else if (wipFiber.props === instance.props && !wipFiber.partialState) {
        cloneChildFibers(wipFiber);
        return;
    }
    instance.props = wipFiber.props;
    instance.state = Object.assign({}, instance.state, wipFiber.partialState);
    wipFiber.partialState = null;
    const newChildElements = instance.render();
    reconcileChildrenArray(wipFiber, newChildElements);
}
function arrify(val) {
    return val == null ? [] : Array.isArray(val) ? val : [val];
}
/**
 * 核心函数，逐步创建 work-in-progress tree，决定提交阶段 （commit phase）需要
 * 做的 DOM 操作（怎么更新 DOM）。
 * 这里主要是比较 alternate 的 children filbers 和 newChildElements （virtual nodes）。
 * @param wipFiber work-in-progress fiber
 * @param newChildElements 要处理的 virtual dom tree(s)，用于创建 children fibers。
 */
function reconcileChildrenArray(wipFiber, newChildElements) {
    const elements = arrify(newChildElements);
    let index = 0;
    let oldFiber = wipFiber.alternate ? wipFiber.alternate.child : null;
    let newFiber = null;
    while (index < elements.length || oldFiber != null) {
        const prevFiber = newFiber;
        const element = index < elements.length && elements[index];
        const sameType = oldFiber && element && element.type === oldFiber.type;
        if (sameType) {
            newFiber = {
                type: oldFiber.type,
                tag: oldFiber.tag,
                stateNode: oldFiber.stateNode,
                hooks: initHooks(oldFiber),
                parent: wipFiber,
                alternate: oldFiber,
                props: element.props,
                partialState: oldFiber.partialState,
                effectTag: Effect.UPDATE
            };
        }
        else {
            if (element) {
                newFiber = {
                    type: element.type,
                    tag: getTag(element.type),
                    props: element.props,
                    hooks: initHooks(),
                    parent: wipFiber,
                    effectTag: Effect.PLACEMENT
                };
            }
            if (oldFiber) {
                oldFiber.effectTag = Effect.DELETION;
                wipFiber.effects = wipFiber.effects || [];
                wipFiber.effects.push(oldFiber);
            }
        }
        if (oldFiber) {
            oldFiber = oldFiber.sibling;
        }
        if (index === 0) {
            wipFiber.child = newFiber;
        }
        else if (prevFiber && element) {
            prevFiber.sibling = newFiber;
        }
        index++;
    }
}
/**
 * 直接复制对应 old fiber 的 children fibers 到 work-in-progress fiber
 * 由于我们确信没有更新，所以只需要复制就好。
 * @param parentFiber work-in-progress fiber
 */
function cloneChildFibers(parentFiber) {
    const oldFiber = parentFiber.alternate;
    if (!oldFiber.child) {
        return;
    }
    let oldChild = oldFiber.child;
    let prevChild = null;
    while (oldChild) {
        const newChild = {
            type: oldChild.type,
            tag: oldChild.tag,
            stateNode: oldChild.stateNode,
            props: oldChild.props,
            partialState: oldChild.partialState,
            alternate: oldChild,
            parent: parentFiber,
            hooks: initHooks(oldChild)
        };
        if (prevChild) {
            prevChild.sibling = newChild;
        }
        else {
            parentFiber.child = newChild;
        }
        prevChild = newChild;
        oldChild = oldChild.sibling;
    }
}
/**
 * 设置 CLASS_COMPONENT fiber 的 __fiber，为 parent fiber 建立 effects。
 * @param fiber 叶子fiber（没有children）或者子fiber已执行过 completework 的fiber
 */
function completeWork(fiber) {
    if (fiber.tag === ITag.CLASS_COMPONENT) {
        fiber.stateNode.__fiber = fiber;
    }
    if (fiber.parent) {
        const childEffects = fiber.effects || [];
        const thisEffect = fiber.effectTag != null ? [fiber] : [];
        const parentEffects = fiber.parent.effects || [];
        fiber.parent.effects = parentEffects.concat(childEffects, thisEffect);
    }
    else {
        pendingCommit = fiber;
    }
}
/**
 * 遍历root fiber的 effects （通过 completeWork 已收集所有变更），执行更新。
 * @param fiber root fiber
 */
function commitAllWork(fiber) {
    (fiber.effects || []).forEach((f) => {
        commitWork(f);
    });
    fiber.stateNode._rootContainerFiber = fiber;
    nextUnitOfWork = null;
    pendingCommit = null;
}
/**
 * 检查 fiber 的 effectTag 并做对应的更新。
 * @param fiber 需要处理的 fiber
 */
function commitWork(fiber) {
    if (fiber.tag === ITag.HOST_ROOT) {
        return;
    }
    let domParentFiber = fiber.parent;
    while (domParentFiber.tag === ITag.CLASS_COMPONENT ||
        domParentFiber.tag === ITag.FUNCTION_COMPONENT) {
        domParentFiber = domParentFiber.parent;
    }
    const domParent = domParentFiber.stateNode;
    let { effects, layoutEffects, destroy } = fiber.hooks;
    if (!destroy)
        fiber.hooks.destroy = destroy = [];
    const onEffect = async (onMount = true) => {
        for (const { callback, canRun } of effects?.values || []) {
            if (canRun) {
                const unMount = await wait(callback, 17)();
                if (unMount && onMount)
                    destroy.push(unMount);
            }
        }
    };
    const onLayoutEffect = (onMount = true) => {
        for (const { callback, canRun } of layoutEffects?.values || []) {
            if (canRun) {
                const unMount = callback();
                if (unMount && onMount)
                    destroy.push(unMount);
            }
        }
    };
    if (fiber.effectTag === Effect.PLACEMENT) {
        if (fiber.tag === ITag.HOST_COMPONENT)
            domParent.appendChild(fiber.stateNode);
        // else if (fiber.tag === ITag.CLASS_COMPONENT)
        // 	// fiber.stateNode.componentDidMount()
        else if (fiber.tag === ITag.FUNCTION_COMPONENT) {
            onEffect();
            onLayoutEffect();
        }
    }
    else if (fiber.effectTag === Effect.UPDATE) {
        if (fiber.tag === ITag.HOST_COMPONENT)
            updateDomProperties(fiber.stateNode, fiber.alternate.props, fiber.props);
        else if (fiber.tag === ITag.FUNCTION_COMPONENT) {
            fiber.hooks.destroy = destroy = [];
            onEffect(false);
            onLayoutEffect(false);
        }
    }
    else if (fiber.effectTag === Effect.DELETION) {
        commitDeletion(fiber, domParent);
        if (fiber.tag === ITag.FUNCTION_COMPONENT) {
            const { destroy } = fiber.hooks;
            for (const unMount of destroy || [])
                unMount();
        }
    }
}
/**
 * 删除 fiber 对应的 DOM。
 * @param fiber 要执行删除的目标 fiber
 * @param domParent fiber 所包含的 DOM 的 parent DOM
 */
function commitDeletion(fiber, domParent) {
    let node = fiber;
    while (true) {
        if (node.tag === ITag.CLASS_COMPONENT ||
            node.tag === ITag.FUNCTION_COMPONENT) {
            node = node.child;
            continue;
        }
        domParent.removeChild(node.stateNode);
        while (node !== fiber && !node.sibling) {
            node = node.parent;
        }
        if (node === fiber) {
            return;
        }
        node = node.sibling;
    }
}
