import {
	createElement,
	FRAGMENT as Fragment,
	OFFSCREEN as Offscreen,
	SUSPENSE as Suspense,
	forEach,
	map,
	isValidElement,
	cloneElement
} from './element';
import { render, createRoot } from './reconciler';
import { Component } from './component';
import { createRef, forwardRef, lazy, wrapPromise } from './utils';

import {
	useEffect,
	useLayoutEffect,
	useState,
	useMemo,
	useCallback,
	useRef,
	useContext,
	useTransition,
	startTransition
} from './hooks';

import { createContext } from './context';
// export * from './interface';

const Children = { map, forEach };

export default {
	createElement,
	cloneElement,
	render,
	createRoot,
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
	useTransition,
	startTransition,
	createContext,
	Offscreen,
	Suspense,
	lazy
};

export {
	createElement,
	cloneElement,
	render,
	createRoot,
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
	useTransition,
	startTransition,
	Offscreen,
	Suspense,
	lazy,
	wrapPromise
};
