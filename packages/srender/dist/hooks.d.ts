import { IFiber, Ref } from './interface';
export declare function initHooks(fiber?: IFiber): {
    refs?: undefined;
    states?: undefined;
    effects?: undefined;
    layoutEffects?: undefined;
} | {
    refs: {
        index: number;
        values: Ref<any>[];
    } | undefined;
    states: {
        index: number;
        values: any[];
    } | undefined;
    effects: {
        index: number;
        values: {
            callback: () => void | (() => void);
            canRun: boolean;
        }[];
    } | undefined;
    layoutEffects: {
        index: number;
        values: {
            callback: () => void | (() => void);
            canRun: boolean;
        }[];
    } | undefined;
};
export declare function setCurrentFiber(wip: IFiber): void;
export declare const useRef: <T>(initValue?: T) => {
    current: T | null;
};
export declare const useState: <T = any>(initalState: T) => any[];
export declare const useLayoutEffect: (callback: () => void | (() => void), deps?: any[]) => void;
export declare const useEffect: (callback: () => void | (() => void), deps?: any[]) => void;
