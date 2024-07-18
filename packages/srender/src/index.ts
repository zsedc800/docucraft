import {
	createElement,
	FRAGMENT as Fragment,
	OFFSCREEN as Offscreen,
	SUSPENSE as Suspense,
	forEach,
	map,
	isValidElement
} from './element';
import { render } from './reconciler';
import { Component } from './component';
import { createRef, forwardRef, lazy, wrapPromise } from './utils';

import {
	useEffect,
	useLayoutEffect,
	useState,
	useMemo,
	useCallback,
	useRef,
	useContext
} from './hooks';

import { createContext } from './context';
// export * from './interface';

const Children = { map, forEach };

export default {
	createElement,
	render,
	Fragment,
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
	createContext,
	Offscreen,
	Suspense,
	lazy
};

export {
	createElement,
	render,
	Fragment,
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
	createContext,
	Offscreen,
	Suspense,
	lazy,
	wrapPromise
};
