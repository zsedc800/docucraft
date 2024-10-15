import {
	createElement,
	Fragment,
	Offscreen,
	Suspense,
	forEach,
	map,
	toArray,
	only,
	isValidElement,
	cloneElement,
	createPortal,
	forwardRef
} from './element';
import { render, createRoot } from './reconciler';
import { Component } from './component';
import { useId, lazy, wrapPromise, createRef } from './utils';

import {
	useEffect,
	useLayoutEffect,
	useState,
	useMemo,
	useCallback,
	useRef,
	useContext,
	useTransition,
	startTransition,
	useImperativeHandle,
	useDebugValue
} from './hooks';

import { createContext } from './context';
// export * from './interface';

const Children = { map, forEach, toArray, only };

export default {
	createElement,
	createPortal,
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
	useImperativeHandle,
	useDebugValue,
	useId,
	startTransition,
	createContext,
	Offscreen,
	Suspense,
	lazy
};

export {
	createElement,
	createPortal,
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
	useId,
	createContext,
	useTransition,
	useImperativeHandle,
	useDebugValue,
	startTransition,
	Offscreen,
	Suspense,
	lazy,
	wrapPromise
};
