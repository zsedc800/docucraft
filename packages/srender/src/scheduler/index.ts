import { TaskQueue } from './taskQueue';

export const NoPriority = 0;
export const ImmediatePriority = 1;
export const UserBlockingPriority = 2;
export const NormalPriority = 3;
export const LowPriority = 4;
export const IdlePriority = 5;

const maxSigned31BitInt = 1073741823;
export const IMMEDIATE_PRIORITY_TIMEOUT = -1;
export const USER_BLOCKING_PRIORITY_TIMEOUT = 250;
export const NORMAL_PRIORITY_TIMEOUT = 5000;
export const LOW_PRIORITY_TIMEOUT = 10000;
export const IDLE_PRIORITY_TIMEOUT = maxSigned31BitInt;

const taskQueue = new TaskQueue<Task>();
const timerQueue = new TaskQueue<Task>();

let isSchedulerPaused = false;
let currentTask: Task | null = null;
let currentPriorityLevel = NormalPriority;
let isPerformingWork = false;

let isHostCallbackScheduled = false;
let isHostTimeoutScheduled = false;

let taskIdCounter = 0;
let deadline: number = 0;
let yieldInterval = 5;

const maxYieldInterval = 300;

type WorkFn = (hasTimeRemaining: boolean, initialTime: number) => boolean;
export let requestHostCallback: (cb: WorkFn) => void;
export let scheduledHostCallback: WorkFn | null = null;
export interface Task {
	id: number;
	callback: ((...args: any) => any) | null;
	priorityLevel: number;
	startTime: number;
	expirationTime: number;
	sortIndex: number;
	isQueued?: boolean;
}

function timeoutForPriorityLevel(priorityLevel: number) {
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

export const getCurrentTime = (() => {
	const initialTime = Date.now();
	const hasPerformanceNow =
		typeof performance === 'object' && typeof performance.now === 'function';
	if (hasPerformanceNow) return () => performance.now();
	else return () => Date.now() - initialTime;
})();

function push(queue: TaskQueue<Task>, task: Task) {
	queue.push(task);
}

function peek(queue: TaskQueue<Task>) {
	return queue.peek();
}

function shift(queue: TaskQueue<Task>) {
	return queue.shift();
}

function workLoop(hasTimeRemaining: boolean, initialTime: number) {
	let currentTime = getCurrentTime();
	advanceTimers(currentTime);
	currentTask = peek(taskQueue);

	while (currentTask) {
		const { callback } = currentTask;

		if (callback) {
			currentTask.callback = null;
			currentPriorityLevel = currentTask.priorityLevel;
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

	if (currentTask) return true;
	else {
		const firstTimer = peek(timerQueue);
		if (firstTimer)
			requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
		return false;
	}
}

function flushWork(hasTimeRemaining: boolean, initialTime: number) {
	isHostCallbackScheduled = false;
	if (isHostTimeoutScheduled) {
		isHostTimeoutScheduled = false;
		cancelHostTimeout();
	}
	isPerformingWork = true;
	const previousPriorityLevel = currentPriorityLevel;
	const res = workLoop(hasTimeRemaining, initialTime);
	currentTask = null;
	currentPriorityLevel = previousPriorityLevel;
	isPerformingWork = false;
	return res;
}

export function scheduleCallback(
	priorityLevel: number,
	callback: (...args: any[]) => void,
	options?: { delay: number }
) {
	const currentTime = getCurrentTime();
	let startTime,
		delay = 0;
	if (
		typeof options === 'object' &&
		options !== null &&
		typeof delay === 'number' &&
		delay > 0
	) {
		delay = options.delay;
	}

	startTime = currentTime + delay;
	const timeout = timeoutForPriorityLevel(priorityLevel);
	const expirationTime = startTime + timeout;

	const newTask: Task = {
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
			if (isHostTimeoutScheduled) cancelHostTimeout();
			else isHostTimeoutScheduled = true;
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

export function shouldYieldToHost() {
	const res = getCurrentTime() - deadline > 0;

	return res;
}

export const shouldYield = shouldYieldToHost;

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

export function cancelHostCallback() {
	scheduledHostCallback = null;
}
let taskTimeoutID: any;
function requestHostTimeout(callback: any, ms: number) {
	taskTimeoutID = setTimeout(() => callback(getCurrentTime()), ms);
}

export function cancelHostTimeout() {
	clearTimeout(taskTimeoutID);
	taskTimeoutID = -1;
}

function handleTimeout(currentTime: number) {
	isHostTimeoutScheduled = false;
	advanceTimers(currentTime);
	if (!isHostCallbackScheduled) {
		if (peek(taskQueue)) {
			isHostCallbackScheduled = true;
			requestHostCallback(flushWork);
		} else {
			const firstTimer = peek(timerQueue);
			if (firstTimer)
				requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
		}
	}
}

function advanceTimers(currentTime: number) {
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
