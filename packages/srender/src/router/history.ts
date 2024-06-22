export enum Action {
	Pop = 'POP',

	Push = 'PUSH',

	Replace = 'REPLACE'
}

export type Pathname = string;

export type Search = string;

export type Hash = string;

export type State = unknown;

export type Key = string;

export interface Path {
	pathname: Pathname;

	search: Search;

	hash: Hash;
}

export interface Location extends Path {
	state: unknown;

	key: Key;
}

export type PartialPath = Partial<Path>;

export type PartialLocation = Partial<Location>;

export interface Update {
	action: Action;

	location: Location;
}

export interface Listener {
	(update: Update): void;
}

export interface Transition extends Update {
	retry(): void;
}

export interface Blocker {
	(tx: Transition): void;
}

export type To = string | Partial<Path>;

export interface History {
	readonly action: Action;

	readonly location: Location;

	createHref(to: To): string;

	push(to: To, state?: any): void;

	replace(to: To, state?: any): void;

	go(delta: number): void;

	back(): void;

	forward(): void;

	listen(listener: Listener): () => void;

	block(blocker: Blocker): () => void;
}

export interface BrowserHistory extends History {}

export interface HashHistory extends History {}

export interface MemoryHistory extends History {
	readonly index: number;
}

const readOnly: <T>(obj: T) => Readonly<T> = (obj) => obj;

function warning(cond: any, message: string) {
	if (!cond) {
		if (typeof console !== 'undefined') console.warn(message);

		try {
			//

			throw new Error(message);
		} catch (e) {}
	}
}

type HistoryState = {
	usr: any;
	key?: string;
	idx: number;
};

const BeforeUnloadEventType = 'beforeunload';
const HashChangeEventType = 'hashchange';
const PopStateEventType = 'popstate';

export type BrowserHistoryOptions = { window?: Window };

export function createBrowserHistory(
	options: BrowserHistoryOptions = {}
): BrowserHistory {
	let { window = document.defaultView! } = options;
	let globalHistory = window.history;

	function getIndexAndLocation(): [number, Location] {
		let { pathname, search, hash } = window.location;
		let state = globalHistory.state || {};
		return [
			state.idx,
			readOnly<Location>({
				pathname,
				search,
				hash,
				state: state.usr || null,
				key: state.key || 'default'
			})
		];
	}

	let blockedPopTx: Transition | null = null;
	function handlePop() {
		if (blockedPopTx) {
			blockers.call(blockedPopTx);
			blockedPopTx = null;
		} else {
			let nextAction = Action.Pop;
			let [nextIndex, nextLocation] = getIndexAndLocation();

			if (blockers.length) {
				if (nextIndex != null) {
					let delta = index - nextIndex;
					if (delta) {
						blockedPopTx = {
							action: nextAction,
							location: nextLocation,
							retry() {
								go(delta);
							}
						};

						go(delta);
					}
				} else {
					warning(
						false,

						`You are trying to block a POP navigation to a location that was not ` +
							`created by the history library. The block will fail silently in ` +
							`production, but in general you should do all navigation with the ` +
							`history library (instead of using window.history.pushState directly) ` +
							`to avoid this situation.`
					);
				}
			} else {
				applyTx(nextAction);
			}
		}
	}

	window.addEventListener(PopStateEventType, handlePop);

	let action = Action.Pop;
	let [index, location] = getIndexAndLocation();
	let listeners = createEvents<Listener>();
	let blockers = createEvents<Blocker>();

	if (index == null) {
		index = 0;
		globalHistory.replaceState({ ...globalHistory.state, idx: index }, '');
	}

	function createHref(to: To) {
		return typeof to === 'string' ? to : createPath(to);
	}

	function getNextLocation(to: To, state: any = null): Location {
		return readOnly<Location>({
			pathname: location.pathname,
			hash: '',
			search: '',
			...(typeof to === 'string' ? parsePath(to) : to),
			state,
			key: createKey()
		});
	}

	function getHistoryStateAndUrl(
		nextLocation: Location,
		index: number
	): [HistoryState, string] {
		return [
			{
				usr: nextLocation.state,
				key: nextLocation.key,
				idx: index
			},
			createHref(nextLocation)
		];
	}

	function allowTx(action: Action, location: Location, retry: () => void) {
		return (
			!blockers.length || (blockers.call({ action, location, retry }), false)
		);
	}

	function applyTx(nextAction: Action) {
		action = nextAction;
		[index, location] = getIndexAndLocation();
		listeners.call({ action, location });
	}

	function push(to: To, state?: any) {
		let nextAction = Action.Push;
		let nextLocation = getNextLocation(to, state);
		function retry() {
			push(to, state);
		}

		if (allowTx(nextAction, nextLocation, retry)) {
			let [historyState, url] = getHistoryStateAndUrl(nextLocation, index + 1);

			try {
				globalHistory.pushState(historyState, '', url);
			} catch (error) {
				window.location.assign(url);
			}

			applyTx(nextAction);
		}
	}

	function replace(to: To, state?: any) {
		let nextAction = Action.Replace;
		let nextLocation = getNextLocation(to, state);
		function retry() {
			replace(to, state);
		}

		if (allowTx(nextAction, nextLocation, retry)) {
			let [historyState, url] = getHistoryStateAndUrl(nextLocation, index);

			globalHistory.replaceState(historyState, '', url);

			applyTx(nextAction);
		}
	}

	function go(delta: number) {
		globalHistory.go(delta);
	}

	let history: BrowserHistory = {
		get action() {
			return action;
		},
		get location() {
			return location;
		},
		createHref,
		push,
		replace,
		go,
		back() {
			go(-1);
		},
		forward() {
			go(1);
		},
		listen(listener) {
			return listeners.push(listener);
		},
		block(blocker) {
			let unblock = blockers.push(blocker);

			if (blockers.length === 1) {
				window.addEventListener(BeforeUnloadEventType, promptBeforeUnload);
			}

			return function () {
				unblock();

				if (!blockers.length) {
					window.removeEventListener(BeforeUnloadEventType, promptBeforeUnload);
				}
			};
		}
	};

	return history;
}

export type HashHistoryOptions = { window?: Window };

export function createHashHistory(
	options: HashHistoryOptions = {}
): HashHistory {
	let { window = document.defaultView! } = options;
	let globalHistory = window.history;

	function getIndexAndLocation(): [number, Location] {
		let {
			pathname = '/',
			search = '',
			hash = ''
		} = parsePath(window.location.hash.substr(1));
		let state = globalHistory.state || {};
		return [
			state.idx,
			readOnly<Location>({
				pathname,
				search,
				hash,
				state: state.usr || null,
				key: state.key || 'default'
			})
		];
	}

	let blockedPopTx: Transition | null = null;
	function handlePop() {
		if (blockedPopTx) {
			blockers.call(blockedPopTx);
			blockedPopTx = null;
		} else {
			let nextAction = Action.Pop;
			let [nextIndex, nextLocation] = getIndexAndLocation();

			if (blockers.length) {
				if (nextIndex != null) {
					let delta = index - nextIndex;
					if (delta) {
						blockedPopTx = {
							action: nextAction,
							location: nextLocation,
							retry() {
								go(delta);
							}
						};

						go(delta);
					}
				} else {
					warning(
						false,

						`You are trying to block a POP navigation to a location that was not ` +
							`created by the history library. The block will fail silently in ` +
							`production, but in general you should do all navigation with the ` +
							`history library (instead of using window.history.pushState directly) ` +
							`to avoid this situation.`
					);
				}
			} else {
				applyTx(nextAction);
			}
		}
	}

	window.addEventListener(PopStateEventType, handlePop);

	window.addEventListener(HashChangeEventType, () => {
		let [, nextLocation] = getIndexAndLocation();

		if (createPath(nextLocation) !== createPath(location)) {
			handlePop();
		}
	});

	let action = Action.Pop;
	let [index, location] = getIndexAndLocation();
	let listeners = createEvents<Listener>();
	let blockers = createEvents<Blocker>();

	if (index == null) {
		index = 0;
		globalHistory.replaceState({ ...globalHistory.state, idx: index }, '');
	}

	function getBaseHref() {
		let base = document.querySelector('base');
		let href = '';

		if (base && base.getAttribute('href')) {
			let url = window.location.href;
			let hashIndex = url.indexOf('#');
			href = hashIndex === -1 ? url : url.slice(0, hashIndex);
		}

		return href;
	}

	function createHref(to: To) {
		return getBaseHref() + '#' + (typeof to === 'string' ? to : createPath(to));
	}

	function getNextLocation(to: To, state: any = null): Location {
		return readOnly<Location>({
			pathname: location.pathname,
			hash: '',
			search: '',
			...(typeof to === 'string' ? parsePath(to) : to),
			state,
			key: createKey()
		});
	}

	function getHistoryStateAndUrl(
		nextLocation: Location,
		index: number
	): [HistoryState, string] {
		return [
			{
				usr: nextLocation.state,
				key: nextLocation.key,
				idx: index
			},
			createHref(nextLocation)
		];
	}

	function allowTx(action: Action, location: Location, retry: () => void) {
		return (
			!blockers.length || (blockers.call({ action, location, retry }), false)
		);
	}

	function applyTx(nextAction: Action) {
		action = nextAction;
		[index, location] = getIndexAndLocation();
		listeners.call({ action, location });
	}

	function push(to: To, state?: any) {
		let nextAction = Action.Push;
		let nextLocation = getNextLocation(to, state);
		function retry() {
			push(to, state);
		}

		warning(
			nextLocation.pathname.charAt(0) === '/',
			`Relative pathnames are not supported in hash history.push(${JSON.stringify(
				to
			)})`
		);

		if (allowTx(nextAction, nextLocation, retry)) {
			let [historyState, url] = getHistoryStateAndUrl(nextLocation, index + 1);

			try {
				globalHistory.pushState(historyState, '', url);
			} catch (error) {
				window.location.assign(url);
			}

			applyTx(nextAction);
		}
	}

	function replace(to: To, state?: any) {
		let nextAction = Action.Replace;
		let nextLocation = getNextLocation(to, state);
		function retry() {
			replace(to, state);
		}

		warning(
			nextLocation.pathname.charAt(0) === '/',
			`Relative pathnames are not supported in hash history.replace(${JSON.stringify(
				to
			)})`
		);

		if (allowTx(nextAction, nextLocation, retry)) {
			let [historyState, url] = getHistoryStateAndUrl(nextLocation, index);

			globalHistory.replaceState(historyState, '', url);

			applyTx(nextAction);
		}
	}

	function go(delta: number) {
		globalHistory.go(delta);
	}

	let history: HashHistory = {
		get action() {
			return action;
		},
		get location() {
			return location;
		},
		createHref,
		push,
		replace,
		go,
		back() {
			go(-1);
		},
		forward() {
			go(1);
		},
		listen(listener) {
			return listeners.push(listener);
		},
		block(blocker) {
			let unblock = blockers.push(blocker);

			if (blockers.length === 1) {
				window.addEventListener(BeforeUnloadEventType, promptBeforeUnload);
			}

			return function () {
				unblock();

				if (!blockers.length) {
					window.removeEventListener(BeforeUnloadEventType, promptBeforeUnload);
				}
			};
		}
	};

	return history;
}

export type InitialEntry = string | Partial<Location>;

export type MemoryHistoryOptions = {
	initialEntries?: InitialEntry[];
	initialIndex?: number;
};

export function createMemoryHistory(
	options: MemoryHistoryOptions = {}
): MemoryHistory {
	let { initialEntries = ['/'], initialIndex } = options;
	let entries: Location[] = initialEntries.map((entry) => {
		let location = readOnly<Location>({
			pathname: '/',
			search: '',
			hash: '',
			state: null,
			key: createKey(),
			...(typeof entry === 'string' ? parsePath(entry) : entry)
		});

		warning(
			location.pathname.charAt(0) === '/',
			`Relative pathnames are not supported in createMemoryHistory({ initialEntries }) (invalid entry: ${JSON.stringify(
				entry
			)})`
		);

		return location;
	});
	let index = clamp(
		initialIndex == null ? entries.length - 1 : initialIndex,
		0,
		entries.length - 1
	);

	let action = Action.Pop;
	let location = entries[index];
	let listeners = createEvents<Listener>();
	let blockers = createEvents<Blocker>();

	function createHref(to: To) {
		return typeof to === 'string' ? to : createPath(to);
	}

	function getNextLocation(to: To, state: any = null): Location {
		return readOnly<Location>({
			pathname: location.pathname,
			search: '',
			hash: '',
			...(typeof to === 'string' ? parsePath(to) : to),
			state,
			key: createKey()
		});
	}

	function allowTx(action: Action, location: Location, retry: () => void) {
		return (
			!blockers.length || (blockers.call({ action, location, retry }), false)
		);
	}

	function applyTx(nextAction: Action, nextLocation: Location) {
		action = nextAction;
		location = nextLocation;
		listeners.call({ action, location });
	}

	function push(to: To, state?: any) {
		let nextAction = Action.Push;
		let nextLocation = getNextLocation(to, state);
		function retry() {
			push(to, state);
		}

		warning(
			location.pathname.charAt(0) === '/',
			`Relative pathnames are not supported in memory history.push(${JSON.stringify(
				to
			)})`
		);

		if (allowTx(nextAction, nextLocation, retry)) {
			index += 1;
			entries.splice(index, entries.length, nextLocation);
			applyTx(nextAction, nextLocation);
		}
	}

	function replace(to: To, state?: any) {
		let nextAction = Action.Replace;
		let nextLocation = getNextLocation(to, state);
		function retry() {
			replace(to, state);
		}

		warning(
			location.pathname.charAt(0) === '/',
			`Relative pathnames are not supported in memory history.replace(${JSON.stringify(
				to
			)})`
		);

		if (allowTx(nextAction, nextLocation, retry)) {
			entries[index] = nextLocation;
			applyTx(nextAction, nextLocation);
		}
	}

	function go(delta: number) {
		let nextIndex = clamp(index + delta, 0, entries.length - 1);
		let nextAction = Action.Pop;
		let nextLocation = entries[nextIndex];
		function retry() {
			go(delta);
		}

		if (allowTx(nextAction, nextLocation, retry)) {
			index = nextIndex;
			applyTx(nextAction, nextLocation);
		}
	}

	let history: MemoryHistory = {
		get index() {
			return index;
		},
		get action() {
			return action;
		},
		get location() {
			return location;
		},
		createHref,
		push,
		replace,
		go,
		back() {
			go(-1);
		},
		forward() {
			go(1);
		},
		listen(listener) {
			return listeners.push(listener);
		},
		block(blocker) {
			return blockers.push(blocker);
		}
	};

	return history;
}

function clamp(n: number, lowerBound: number, upperBound: number) {
	return Math.min(Math.max(n, lowerBound), upperBound);
}

function promptBeforeUnload(event: BeforeUnloadEvent) {
	event.preventDefault();

	event.returnValue = '';
}

type Events<F> = {
	length: number;
	push: (fn: F) => () => void;
	call: (arg: any) => void;
};

function createEvents<F extends Function>(): Events<F> {
	let handlers: F[] = [];

	return {
		get length() {
			return handlers.length;
		},
		push(fn: F) {
			handlers.push(fn);
			return function () {
				handlers = handlers.filter((handler) => handler !== fn);
			};
		},
		call(arg) {
			handlers.forEach((fn) => fn && fn(arg));
		}
	};
}

function createKey() {
	return Math.random().toString(36).substr(2, 8);
}

export function createPath({
	pathname = '/',
	search = '',
	hash = ''
}: Partial<Path>) {
	if (search && search !== '?')
		pathname += search.charAt(0) === '?' ? search : '?' + search;
	if (hash && hash !== '#')
		pathname += hash.charAt(0) === '#' ? hash : '#' + hash;
	return pathname;
}

export function parsePath(path: string): Partial<Path> {
	let parsedPath: Partial<Path> = {};

	if (path) {
		let hashIndex = path.indexOf('#');
		if (hashIndex >= 0) {
			parsedPath.hash = path.substr(hashIndex);
			path = path.substr(0, hashIndex);
		}

		let searchIndex = path.indexOf('?');
		if (searchIndex >= 0) {
			parsedPath.search = path.substr(searchIndex);
			path = path.substr(0, searchIndex);
		}

		if (path) {
			parsedPath.pathname = path;
		}
	}

	return parsedPath;
}
